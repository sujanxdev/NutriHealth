import sys
import json
import pandas as pd
import nltk
from flask import Flask, request, jsonify
from Bio_Epidemiology_NER.bio_recognizer import ner_prediction
import os
from flask_cors import CORS
from fuzzywuzzy import fuzz, process
from concurrent.futures import ThreadPoolExecutor

nltk.download('punkt')

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"])

# Preload dataframes
def load_dataframes():
    try:
        sup_1 = pd.read_csv("LabelStatements_1.csv", engine='python')
        sup_2 = pd.read_csv("LabelStatements_2.csv", engine="python")
        prover_1 = pd.read_csv("ProductOverview_1.csv", engine="python")
        prover_2 = pd.read_csv("ProductOverview_2.csv", engine="python")
        othing_1 = pd.read_csv("OtherIngredients_1.csv", engine="python")
        othing_2 = pd.read_csv("OtherIngredients_2.csv", engine="python")

        # Merge and clean data
        sup_merged = pd.concat([sup_1, sup_2], ignore_index=True)
        prover_merged = pd.concat([prover_1, prover_2], ignore_index=True)
        othing_merged = pd.concat([othing_1, othing_2], ignore_index=True)

        sup_merged = sup_merged[sup_merged["Statement Type"] == "Other"]
        full_merged = pd.merge(prover_merged, sup_merged, how="right", on=["URL", "DSLD ID", "Product Name"])
        full_merged = pd.merge(full_merged, othing_merged, how="right", on=["URL", "DSLD ID", "Product Name"])

        return full_merged
    except Exception as e:
        raise ValueError(f"Error processing dataframes: {str(e)}")

# Preload data
full_merged = load_dataframes()

@app.route('/')
def home():
    return "Welcome to the Flask app for recommendations!"

@app.route('/health')
def health_check():
    return "Flask app is running!"

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json()

        # Extract and validate inputs
        gender = data.get('gender', '').strip()
        age = data.get('age', None)
        allergic_food = data.get('allergic_food', '').strip()
        health_goals = data.get('health_goals', '').strip()
        brand_preference = data.get('brand_preference', 'Nan')  # Default to 'Nan' if not provided
        market_status = data.get('market_status', True)  # Default to True (on market) if not provided

        if not health_goals:
            return jsonify({"error": "Health goals are required"}), 400
        if age is None or not isinstance(age, int) or age < 0:
            return jsonify({"error": "Invalid age"}), 400

        # Process the input through NLP
        input_text = f"User Gender: {gender}, Age: {age}, Allergic Foods: {allergic_food}, Health Goals/Symptoms: {health_goals}"
        analysed = ner_prediction(corpus=f"CASE: {input_text}", compute='cpu')

        if analysed.empty:
            return jsonify({"error": "Cannot analyze user input. Please provide more specific details."}), 400

        # Filter based on NLP results
        analysed_filtered = analysed[(analysed["entity_group"] == "Diagnostic_procedure") | (analysed["entity_group"] == "Biological_structure")]
        analysed_df = full_merged[full_merged["Statement"].str.contains("|".join(analysed_filtered["value"]), na=False)]

        # Apply filters based on user input
        def filter_data(df):
            df = filter_by_age(df, age)
            df = filter_by_brand(df, brand_preference)
            df = filter_by_market_status(df, market_status)
            df = filter_by_allergy(df, allergic_food)
            return df

        with ThreadPoolExecutor() as executor:
            final_df = list(executor.map(filter_data, [analysed_df]))[0]

        if final_df.empty:
            return jsonify({"error": "No suitable recommendations found based on the input."}), 404

        # Exact Match Filter for health_goals
        final_df = final_df[final_df["Statement"].str.contains(health_goals, case=False, na=False)]

        if final_df.empty:
            return jsonify({"error": "No recommendations found with an exact match for the health goals."}), 404

        # Sort and rank recommendations based on relevance
        final_df["Relevance_Score"] = final_df["Statement"].apply(lambda x: sum(1 for goal in health_goals.split(",") if goal.strip().lower() in x.lower()))
        final_df = final_df.sort_values(by="Relevance_Score", ascending=False)

        # Remove duplicates before sending recommendations
        final_df = remove_duplicates(final_df)

        # Filter to only include the top 10 perfect matches based on user input
        perfect_match_df = final_df[final_df["Relevance_Score"] == len(health_goals.split(","))]

        if perfect_match_df.empty:
            result = final_df.head(20).to_json(orient="split")
        else:
            result = perfect_match_df.head(20).to_json(orient="split")

        parsed = json.loads(result)

        return jsonify({"recommendations": parsed})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Helper functions
def filter_by_allergy(df, allergic_food):
    allergy_list = [food.strip().lower() for food in allergic_food.split(",")]
    allergens = {
        'peanuts': ['peanuts'], 'nuts': ['nuts', 'almonds', 'cashews', 'pistachios'],
        'milk': ['cheese', 'butter', 'milk'], 'eggs': ['eggs'],
        'fish': ['fish', 'salmon'], 'shellfish': ['shrimp', 'crab'],
        'wheat': ['bread', 'pasta'], 'soy': ['soy'],
        'mustard': ['mustard'], 'sesame': ['sesame'], 'celery': ['celery']
    }

    for allergy, ingredients in allergens.items():
        if any(fuzz.partial_ratio(allergy, food) > 80 for food in allergy_list):
            for ingredient in ingredients:
                df = df[~df["Other Ingredients"].str.contains(ingredient, case=False, na=False)]
    return df

def filter_by_age(df, age):
    if age <= 6:
        return df[df["Supplement Form [LanguaL]"].isin(['Powder', 'Liquid', 'Gummy or Jelly'])]
    return df

def filter_by_brand(df, brand_preference):
    if brand_preference != 'Nan':
        return df[df["Brand Name"].str.contains(brand_preference, case=False)]
    return df

def filter_by_market_status(df, market_status):
    if market_status:
        return df[df["Market Status"] == "On Market"]
    return df

def remove_duplicates(df):
    return df.drop_duplicates(subset=["Product Name"], keep="first")

if __name__ == "__main__":
    app.run(debug=True)
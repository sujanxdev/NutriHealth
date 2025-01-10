import sys
import json
import pandas as pd
import nltk
from flask import Flask, request, jsonify
from Bio_Epidemiology_NER.bio_recognizer import ner_prediction
import os
from flask_cors import CORS

nltk.download('punkt')

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"])

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

        # Process CSV files
        def process_dataframes():
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

        # Apply allergy filters
        def filter_by_allergy(analysed_df, allergic_food):
            allergic_food_dict = {
                'peanuts': ['peanuts'], 'nuts': ['nuts', 'Walnuts', 'almonds', 'cashews', 'pistachios', 'pecans', 'hazelnuts'],
                'milk': ['cheese', 'butter', 'yogurt', 'milk', 'dairy'], 'eggs': ['chicken', 'egg', 'eggs'],
                'fish': ['fish', 'salmon', 'tuna', 'halibut'], 'shellfish': ['shellfish', 'shrimp', 'crab', 'lobster', 'mussel'],
                'wheat': ['bread', 'wheat', 'pasta', 'baked'], 'soy': ['soy', 'tofu'], 'mustard': ['mustard', 'mustard seed'],
                'sesame': ['sesame', 'sesame oil', 'sesame seed'], 'celery': ['celery'], 'sulfites': ['sulfite'],
                'lupin': ['lupin'], 'mollusks': ['octopus', 'squid', 'cuttlefish'], 'kiwi': ['kiwi'],
                'pineapple': ['pineapple'], 'avocado': ['avocado', 'guacamole'], 'banana': ['banana'],
                'strawberries': ['strawberry'], 'tomato': ['tomato']
            }

            allergy_list = [key for food in allergic_food.split(",") for key, val in allergic_food_dict.items() if food.strip().lower() in val]

            for allergy in allergy_list:
                analysed_df = analysed_df[~analysed_df["Other Ingredients"].str.contains(allergy, case=False, na=False)]

            return analysed_df

        # Filter based on age (children's products)
        def filter_by_age(analysed_df, age):
            if age <= 6:
                child_rec = pd.DataFrame({'Supplement Form [LanguaL]': ['Powder', 'Liquid', 'Gummy or Jelly']})
                new_df = pd.DataFrame()

                for _, row in child_rec.iterrows():
                    new_df = pd.concat([new_df, analysed_df[analysed_df["Supplement Form [LanguaL]"].str.contains(row['Supplement Form [LanguaL]'], case=False)]])
                
                analysed_df = pd.concat([new_df, analysed_df.drop(new_df.index)])
            return analysed_df

        # Filter based on brand preference
        def filter_by_brand(analysed_df, brand_preference):
            if brand_preference != 'Nan':
                brand_rec = pd.DataFrame({'Brand Name': [brand_preference]})
                new_df = pd.DataFrame()

                for _, row in brand_rec.iterrows():
                    new_df = pd.concat([new_df, analysed_df[analysed_df["Brand Name"].str.contains(row['Brand Name'], case=False)]])
                
                analysed_df = pd.concat([new_df, analysed_df[~analysed_df.index.isin(new_df.index)]])
            return analysed_df

        # Filter based on market status
        def filter_by_market_status(analysed_df, market_status):
            if market_status:
                on_rec = pd.DataFrame({'Market Status': ['On Market']})
                new_df = pd.DataFrame()

                for _, row in on_rec.iterrows():
                    new_df = pd.concat([new_df, analysed_df[analysed_df["Market Status"].str.contains(row['Market Status'], case=False)]])
                
                analysed_df = new_df
            return analysed_df

        # Remove duplicates from dataframe based on "Product Name"
        def remove_duplicates(analysed_df):
            analysed_df = analysed_df.drop_duplicates(subset=["Product Name"], keep="first")
            return analysed_df

        # Process the input through NLP
        input_text = f"User Gender: {gender}, Age: {age}, Allergic Foods: {allergic_food}, Health Goals/Symptoms: {health_goals}"
        analysed = ner_prediction(corpus=f"CASE: {input_text}", compute='cpu')

        if analysed.empty:
            return jsonify({"error": "Cannot analyze user input. Please provide more specific details."}), 400

        # Process and filter data
        full_merged = process_dataframes()
        analysed_filtered = analysed[(analysed["entity_group"] == "Diagnostic_procedure") | (analysed["entity_group"] == "Biological_structure")]
        analysed_df = full_merged[full_merged["Statement"].str.contains("|".join(analysed_filtered["value"]), na=False)]

        # Apply filters based on user input
        analysed_df = filter_by_age(analysed_df, age)
        analysed_df = filter_by_brand(analysed_df, brand_preference)
        analysed_df = filter_by_market_status(analysed_df, market_status)
        final_df = filter_by_allergy(analysed_df, allergic_food)

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

        # If no perfect match, return the top 10 from the sorted list
        if perfect_match_df.empty:
            result = final_df.head(20).to_json(orient="split")
        else:
            result = perfect_match_df.head(20).to_json(orient="split")

        parsed = json.loads(result)

        return jsonify({"recommendations": parsed})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)

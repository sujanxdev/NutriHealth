import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import './RecommendationsPage.css';
import NavigationMenu from "../components/NavigationMenu"; // Ensure to import NavigationMenu

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedRecommendations = localStorage.getItem("recommendations");

    if (storedRecommendations) {
      try {
        const parsedRecommendations = JSON.parse(storedRecommendations);

        if (parsedRecommendations && parsedRecommendations.data && parsedRecommendations.data.length > 0) {
          setRecommendations(parsedRecommendations.data);
        } else {
          setError("No recommendations found.");
        }
      } catch (err) {
        setError("Error parsing recommendations from localStorage.");
        console.error("Error parsing:", err);
      }
    } else {
      setError("No recommendations found in localStorage.");
    }
  }, []);

  const handleSupplementClick = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="recommendations-container">
      {/* Navigation Menu placed inside the Recommendations Container */}
      <NavigationMenu
        style={{
          position: "absolute", // Keep the menu inside the container
          top: "10px", // Position it 10px from the top of the container
          right: "100px", // 50px space from the right edge
          zIndex: 10, // Ensure it's on top of other elements
          cursor: "pointer",
          width: "50px", // Set size of the button
          height: "50px",
          borderRadius: "50%", // Make it circular
          backgroundColor: "red", // Or any color of your choice
          display: "flex", // To center the icon inside the button
          alignItems: "center", // Center vertically
          justifyContent: "center", // Center horizontally
        }}
      />

      <h1 className="text-center recommendations-header">
        {recommendations.length} recommendations found.
      </h1>

      <p className="text-center note-text">
        Please click on the desired supplement to see more info about them.
      </p>

      {error && <p className="error-message">{error}</p>}

      {recommendations.length > 0 ? (
        <div className="recommendation-grid">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="recommendation-item"
              onClick={() => handleSupplementClick(rec[0])}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-container">
                <h3>{rec[2]}</h3>
                <p>
                  <strong>Brand Name:</strong> {rec[3] || "N/A"}
                </p>
                <p>
                  <strong>Market Status:</strong> {rec[10] || "N/A"}
                </p>
                <p>
                  <strong>Supplement Form:</strong> {rec[8] || "N/A"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p>No recommendations to display.</p>
      )}
    </div>
  );
};

export default RecommendationsPage;

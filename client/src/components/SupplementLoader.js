import React from 'react';
import './SupplementLoader.css'; // You can create a separate CSS file for styles

const SupplementLoader = () => {
  return (
    <div className="content">
      <div className="pill">
        <div className="medicine">
          {Array(20).fill(<i key={Math.random()}></i>)}
        </div>
        <div className="side"></div>
        <div className="side"></div>
      </div>
    </div>
  );
};

export default SupplementLoader;

import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="split-screen">
      <div className="left-section">
        {/* Image is handled in CSS */}
      </div>
      <div className="right-section">
        <h1>Welcome to TravelMate!</h1>
        <div>
          <button onClick={() => window.location.href = '/login'}>Login</button>
          <button onClick={() => window.location.href = '/register'}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

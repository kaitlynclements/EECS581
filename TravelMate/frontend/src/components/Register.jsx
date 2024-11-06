/*
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Handles user registration
*/

import React, { useState } from 'react';
import api from '../services/api';  // Import the API instance
import { useHistory } from 'react-router-dom';
import axios from 'axios';


function Register() {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
      e.preventDefault();
      setError(null); // Reset error before each attempt

      try {
          const response = await axios.post('http://127.0.0.1:5000/register', {
              first_name: first_name,
              last_name: last_name,
              email: email,
              password: password
          });
          console.log("Registration successful:", response.data.message);
          alert(response.data.message);
          // Redirect or provide feedback to the user
      } catch (error) {
          if (error.response) {
              // Server responded with a status other than 200 range
              setError(error.response.data.message || "Registration failed.");
              console.error("Error response:", error.response.data);
          } else if (error.request) {
              // Request was made but no response received
              setError("No response from server.");
              console.error("Error request:", error.request);
          } else {
              // Something else happened while setting up the request
              setError("An error occurred during registration.");
              console.error("Error message:", error.message);
          }
      }
  };

  return (
      <div>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
              <div>
                  <label>First Name:</label>
                  <input
                      type="text"
                      value={first_name}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                  />
              </div>
              <div>
                  <label>Last Name:</label>
                  <input
                      type="text"
                      value={last_name}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                  />
              </div>
              <div>
                  <label>Email:</label>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
              </div>
              <div>
                  <label>Password:</label>
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                  />
              </div>
              <button type="submit">Register</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
  );
}

export default Register;
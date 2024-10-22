/*
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Handles user registration
*/

import React, { useState } from 'react';
import api from '../services/api';  // Import the API instance
import { useHistory } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleRegister = async () => {
    try {
      await api.post('/register', { email, password });
      alert('Registration successful!');
      history.push('/login');  // Redirect to login page after registration
    } catch (error) {
      alert('Registration failed.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;

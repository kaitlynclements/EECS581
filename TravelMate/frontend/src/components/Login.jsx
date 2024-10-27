import React, { useState } from 'react';
import api from '../services/api';
import { useHistory } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { email, password });
      // Assuming the user ID is returned in the response (e.g., response.data.user_id)
      localStorage.setItem('user_id', response.data.user_id);
      alert('Login successful!');
      history.push('/trips');
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;

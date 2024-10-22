/*
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Axios configuration for making API requests
*/

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

export default api;

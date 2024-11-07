/*
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Axios configuration for making API requests
*/

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Your backend URL
});

// Delete a trip by ID
export const deleteTrip = async (tripId) => {
  try {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete trip:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Delete an activity by activity ID and trip ID
export const deleteActivity = async (tripId, activityId) => {
  try {
    const response = await api.delete(`/trips/${tripId}/itinerary/activities/${activityId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete activity:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default api;
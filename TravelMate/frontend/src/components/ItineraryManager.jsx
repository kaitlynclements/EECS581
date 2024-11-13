import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ItineraryManager = () => {
  const [trips, setTrips] = useState({});
  const [tripOptions, setTripOptions] = useState([]); // Stores available trips for the dropdown
  const [typedTripName, setTypedTripName] = useState('');
  const [selectedTripBudget, setSelectedTripBudget] = useState(null); // New state for budget
  const [selectedTripDates, setSelectedTripDates] = useState({ startDate: '', endDate: '' });
  const [activity, setActivity] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
  });

  // Retrieve userId from localStorage
  const userId = localStorage.getItem('user_id');

  // Fetch user's trips when the component mounts
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get(`/trips?user_id=${userId}`);
        setTripOptions(response.data); // Store trips for dropdown
      } catch (error) {
        console.error("Error fetching trips:", error);
        alert("Failed to load trips.");
      }
    };
    fetchTrips();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setActivity((prevActivity) => ({
      ...prevActivity,
      [name]: value,
    }));
  };

  const handleTripNameChange = async (e) => {
    setTypedTripName(e.target.value); // Update selected trip name
    
    // Fetch the selected trip's details, including budget
    const selectedTrip = tripOptions.find((trip) => trip.name === e.target.value);
    if (selectedTrip) {
      try {
        const response = await api.get(`/trips/${selectedTrip.id}`);
        setSelectedTripBudget(response.data.budget); // Store the trip's budget
      } catch (error) {
        console.error("Error fetching trip budget:", error);
      }
    } else {
      setSelectedTripBudget(null); // Reset budget if no trip is selected
    }
  };

  const addActivity = async (e) => {
    e.preventDefault();
    if (activity.name && activity.date && activity.time && activity.location && typedTripName) {
      const newActivity = { ...activity };

      const activityDate = new Date(activity.date);
      const startDate = new Date(selectedTripDates.startDate);
      const endDate = new Date(selectedTripDates.endDate);

      if (activityDate < startDate || activityDate > endDate) {
        return jsonify({'error': "Activity date must be within the trip date range"}), 400;
      }

      try {
        // Find the selected trip ID
        const tripId = tripOptions.find(t => t.name === typedTripName).id;

        // Send the new activity to the backend
        await api.post(`/trips/${tripId}/itinerary/activities`, newActivity);

        // Update local state
        setTrips((prevTrips) => {
          const existingActivities = prevTrips[typedTripName] || [];
          return {
            ...prevTrips,
            [typedTripName]: [...existingActivities, newActivity],
          };
        });

        // Reset form fields after adding
        setActivity({ name: '', date: '', time: '', location: '' });
        setTypedTripName('');
        setSelectedTripBudget(null); // Reset budget when trip is deselected
      } catch (error) {
        if (error.response && error.response.status === 400) {
            alert(error.response.data.error);
        } else {
            alert("Failed to add activity: " + error.message);
        }
      }
    } else {
      alert('Please fill out all fields and select a trip name');
    }
  };

  return (
    <div className="itinerary-manager">
      <h2>Create Itinerary</h2>
      <form onSubmit={addActivity}>
        <div>
          <label>Trip Name:</label>
          <select value={typedTripName} onChange={handleTripNameChange}>
            <option value="">Select a trip</option>
            {tripOptions.map((trip) => (
              <option key={trip.id} value={trip.name}>
                {trip.name}
              </option>
            ))}
          </select>
          {selectedTripBudget !== null && (
            <div>
              <h3>Total Budget: ${selectedTripBudget}</h3>
            </div>
          )}
        </div>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={activity.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={activity.date}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Time:</label>
          <input
            type="time"
            name="time"
            value={activity.time}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={activity.location}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Add Activity</button>
      </form>

      <h3>Planned Activities</h3>
      {Object.keys(trips).length > 0 ? (
        Object.keys(trips).map((tripName) => (
          <div key={tripName} className="trip-activities">
            <h4>{tripName}</h4>
            <ul>
              {trips[tripName].map((activity, index) => (
                <li key={index}>
                  <strong>{activity.name}</strong> - {activity.date} at {activity.time}, {activity.location}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No activities added yet.</p>
      )}
    </div>
  );
};

export default ItineraryManager;

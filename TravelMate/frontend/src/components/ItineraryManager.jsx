import React, { useEffect, useState } from 'react';
import api from '../services/api';


const ItineraryManager = () => {
  const [trips, setTrips] = useState({});
  const [tripOptions, setTripOptions] = useState([]); // Stores available trips for the dropdown
  const [typedTripName, setTypedTripName] = useState('');
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

  const handleTripNameChange = (e) => {
    setTypedTripName(e.target.value); // Update selected trip name
  };

  const addActivity = async (e) => {
    e.preventDefault();
    if (activity.name && activity.date && activity.time && activity.location && typedTripName) {
      const newActivity = { ...activity };

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
      } catch (error) {
        alert('Failed to add activity: ' + error.message);
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


/*
import React, { useState } from 'react';
import api from '../services/api';

const ItineraryManager = () => {
  const [trips, setTrips] = useState({});
  const [typedTripName, setTypedTripName] = useState('');
  const [activity, setActivity] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
  });

  // Retrieve userId from localStorage
  const userId = localStorage.getItem('user_id');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setActivity((prevActivity) => ({
      ...prevActivity,
      [name]: value,
    }));
  };

  const handleTripNameChange = (e) => {
    setTypedTripName(e.target.value);
  };

  const addActivity = async (e) => {
    e.preventDefault();
    if (activity.name && activity.date && activity.time && activity.location && typedTripName) {
      const newActivity = { ...activity };

      try {
        // Fetch trips to find the ID
        const tripResponse = await api.get(`/trips?user_id=${userId}`);
        const tripId = tripResponse.data.find(t => t.name === typedTripName).id;

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
      } catch (error) {
        alert('Failed to add activity: ' + error.message);
      }
    } else {
      alert('Please fill out all fields and provide a trip name');
    }
  };

  // Function to fetch activities for a specific trip
  const fetchActivities = async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}/activities`);
      setTrips(prev => ({ ...prev, [tripId]: response.data }));
    } catch (error) {
      console.error("Error fetching activities:", error);
      alert('Failed to load activities for this trip.');
    }
  };

  return (
    <div className="itinerary-manager">
      <h2>Create Itinerary</h2>
      <form onSubmit={addActivity}>
        <div>
          <label>Trip Name:</label>
          <input
            type="text"
            name="tripName"
            value={typedTripName}
            onChange={handleTripNameChange}
            placeholder="Enter trip name or choose an existing one"
          />
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
*/
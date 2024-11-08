
import React, { useState } from 'react';

const ItineraryManager = () => {
  const [trips, setTrips] = useState({});
  const [typedTripName, setTypedTripName] = useState('');
  const [activity, setActivity] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
  });

  // Handle input changes for activity fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setActivity((prevActivity) => ({
      ...prevActivity,
      [name]: value,
    }));
  };

  // Handle trip name input change
  const handleTripNameChange = (e) => {
    setTypedTripName(e.target.value);
  };

  // Add a new activity to the selected or new trip
  const addActivity = (e) => {
    e.preventDefault();
    if (activity.name && activity.date && activity.time && activity.location && typedTripName) {
      const newActivity = { ...activity };

      // Check if the trip already exists; if not, create a new entry
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
    } else {
      alert('Please fill out all fields and provide a trip name');
    }
  };

  // Delete an activity from a specific trip
  const deleteActivity = (tripName, activityIndex) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      setTrips((prevTrips) => {
        const updatedActivities = prevTrips[tripName].filter((_, index) => index !== activityIndex);
  
        // If there are no remaining activities, remove the trip entry entirely
        if (updatedActivities.length === 0) {
          const { [tripName]: _, ...remainingTrips } = prevTrips;
          return remainingTrips;
        }
  
        // Otherwise, update the trip with the remaining activities
        return {
          ...prevTrips,
          [tripName]: updatedActivities,
        };
      });
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
                  <button onClick={() => deleteActivity(tripName, index)}>Delete</button>
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

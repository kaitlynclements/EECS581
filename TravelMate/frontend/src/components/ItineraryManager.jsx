import React, { useEffect, useState } from 'react';
import api from '../services/api';
import MapComponent from './MapComponent'; // Import the Map component

const ItineraryManager = () => {
  const [trips, setTrips] = useState([]);
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
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState(null);

  // Retrieve userId from localStorage
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchTripsWithActivities = async () => {
      try {
        const response = await api.get(`/trips?user_id=${userId}`);
        const tripsData = response.data;
        console.log("Fetched trips data:", tripsData);

        // Fetch activities for each trip
        const tripsWithActivities = await Promise.all(
          tripsData.map(async (trip) => {
            try {
              const activitiesResponse = await api.get(`/trips/${trip.id}/activities`);
              return {
                ...trip,
                activities: activitiesResponse.data || [], // Set activities to an empty array if none
              };
            } catch (error) {
              console.error(`Error fetching activities for trip ${trip.id}:`, error);
              return { ...trip, activities: [] }; // Set to empty array on error
            }
          })
        );

        setTrips(tripsWithActivities); // Set trips with their activities
        setTripOptions(tripsData); // Populate tripOptions for dropdown
      } catch (error) {
        console.error("Error fetching trips or activities:", error);
        alert("Failed to load trips and activities.");
      }
    };

    fetchTripsWithActivities();
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
  }

  const addActivity = async (e) => {
    e.preventDefault();
    if (activity.name && activity.date && activity.time && activity.location && typedTripName) {
      const newActivity = { ...activity };

      const activityDate = new Date(activity.date);
      const startDate = new Date(selectedTripDates.startDate);
      const endDate = new Date(selectedTripDates.endDate);

      if (activityDate < startDate || activityDate > endDate) {
        return alert("Activity date must be within the trip date range");
      }

      try {
        // Find the selected trip ID
        const tripId = tripOptions.find(t => t.name === typedTripName).id;

        // Send the new activity to the backend
        const response = await api.post(`/trips/${tripId}/itinerary/activities/create`, newActivity);

        // Assuming the response contains the created activity
        const createdActivity = response.data.activity; // Adjust based on your API response

        // Update local state without losing existing activities
        setTrips((prevTrips) =>
          prevTrips.map((trip) =>
            trip.id === tripId
              ? { ...trip, activities: [...trip.activities, { ...newActivity, id: createdActivity }] }
              : trip
          )
        );

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

  const formatDate = (dateString) => {
    if (!dateString) return ''; // Return empty string if dateString is undefined
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript Date
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const editActivity = (trip, activityId) => {
    const activityToEdit = trip.activities.find(act => act.id === activityId);
    setActivity(activityToEdit);
    setIsEditing(true);
    setCurrentActivityId(activityId);
  };

  const updateActivity = async (e) => {
    e.preventDefault();
    try {
      // Send the updated activity to the backend
      await api.put(`/activities/${currentActivityId}`, activity);

      // Update local state to reflect changes
      setTrips((prevTrips) =>
        prevTrips.map((trip) => {
          if (trip.activities) {
            return {
              ...trip,
              activities: trip.activities.map((act) =>
                act.id === currentActivityId ? { ...act, ...activity } : act
              ),
            };
          }
          return trip;
        })
      );

      alert("Activity updated successfully!");
      setIsEditing(false);
      setActivity({ name: '', date: '', time: '', location: '' }); // Reset form
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Failed to update activity.");
    }
  };

  return (
    <div className="itinerary-manager" style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <h1>Manage Itineraries</h1>
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

        <h2>Your Itineraries</h2>
        {Array.isArray(trips) && trips.length > 0 ? (
          trips.map((trip) => (
            <div key={trip.id} className="trip-activities">
              <h3>
                <strong>{trip.name}</strong> - {trip.destination} (
                {formatDate(trip.start_date)} - {formatDate(trip.end_date)})
              </h3>
              <ul>
                {Array.isArray(trip.activities) && trip.activities.length > 0 ? (
                  trip.activities.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
                    .map((activity) => (
                      <li key={activity.id}>
                        <strong>{activity.name}</strong> - {activity.date} at {activity.time}, {activity.location}
                        <button onClick={() => editActivity(trip, activity.id)}>Edit</button>
                      </li>
                    ))
                ) : (
                  <li>No activities created for this trip yet.</li>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p>No trips found.</p>
        )}
      </div>

      <div style={{ width: '30%', marginLeft: '20px' }}>
        <h3>Map</h3>
        <MapComponent width="100%" height="200px" /> {/* Small map */}
      </div>

      {isEditing && (
        <form onSubmit={updateActivity}>
          <input
            type="text"
            name="name"
            value={activity.name}
            onChange={handleInputChange}
            placeholder="Activity Name"
            required
          />
          <input
            type="date"
            name="date"
            value={activity.date}
            onChange={handleInputChange}
            required
          />
          <input
            type="time"
            name="time"
            value={activity.time}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="location"
            value={activity.location}
            onChange={handleInputChange}
            placeholder="Location"
            required
          />
          <button type="submit">Update Activity</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default ItineraryManager;

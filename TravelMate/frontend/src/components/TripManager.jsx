import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { deleteTrip } from '../services/api';
import { useHistory } from 'react-router-dom';

function TripManager() {
  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activities, setActivities] = useState({});
  const history = useHistory();

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) {
      alert("Please log in to view your trips");
      history.push('/login');
    } else {
      fetchUserTrips();
    }
  }, [userId, history]);

  const fetchUserTrips = async () => {
    try {
      const response = await api.get(`/trips?user_id=${userId}`);
      setTrips(response.data);
    } catch (error) {
      alert('Failed to load trips.');
    }
  };

  const fetchActivities = async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}/activities`);
      setActivities(prev => ({ ...prev, [tripId]: response.data }));
    } catch (error) {
      console.error("Error fetching activities:", error);
      alert('Failed to load activities for this trip.');
    }
  };

  const createTrip = async () => {
    try {
      await api.post('/trips', {
        name: tripName,
        destination,
        start_date: startDate,
        end_date: endDate,
        user_id: userId
      });
      fetchUserTrips();
      alert('Trip created successfully!');
    } catch (error) {
      alert('Failed to create trip.');
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteTrip(tripId);
        alert("Trip deleted successfully");
        fetchUserTrips();
      } catch (error) {
        alert("Failed to delete trip");
      }
    }
  };

  const handleDeleteActivity = async (tripId, activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await api.delete(`/trips/${tripId}/itinerary/activities/${activityId}`);
        alert("Activity deleted successfully");
        fetchActivities(tripId); // Refresh activities after deletion
      } catch (error) {
        alert("Failed to delete activity");
      }
    }
  };

  return (
    <div>
      <h2>Manage Trips</h2>
      <button onClick={() => {
        localStorage.removeItem('user_id');
        history.push('/login');
      }}>Logout</button>
      <div>
        <input type="text" placeholder="Trip Name" onChange={(e) => setTripName(e.target.value)} />
        <input type="text" placeholder="Destination" onChange={(e) => setDestination(e.target.value)} />
        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={createTrip}>Create Trip</button>
      </div>
      <h3>Your Trips</h3>
      {trips.length > 0 ? (
        <ul>
          {trips.map(trip => (
            <li key={trip.id}>
              <strong>{trip.name}</strong> - {trip.destination} ({trip.start_date} to {trip.end_date})
              <button onClick={() => fetchActivities(trip.id)}>View Activities</button>
              {activities[trip.id] && (
                <ul>
                  {activities[trip.id].map(activity => (
                    <li key={activity.id}>
                      {activity.name} - {activity.date} at {activity.time}, {activity.location}
                      <button onClick={() => handleDeleteActivity(trip.id, activity.id)}>Delete Activity</button>
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => handleDeleteTrip(trip.id)}>Delete Trip</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No trips found. Create a new trip to get started!</p>
      )}
    </div>
  );
}

export default TripManager;

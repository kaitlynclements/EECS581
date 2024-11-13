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
  const [budget, setBudget] = useState(''); // New state for budget
  const [activities, setActivities] = useState({});
  const [showActivities, setShowActivities] = useState({});
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
      console.log("Trips fetched:", response.data);
      setTrips(response.data);
    } catch (error) {
      alert('Failed to load trips.');
    }
  };

  const fetchActivities = async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}/activities`);
      if (response.data.length === 0) {
        setActivities(prev => ({ ...prev, [tripId]: 'No activities created for this trip yet' }));
      } else {
        setActivities(prev => ({ ...prev, [tripId]: response.data }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Handle 404 specifically by setting a message
        setActivities(prev => ({ ...prev, [tripId]: 'No activities created for this trip yet' }));
      } else {
        console.error("Error fetching activities:", error);
        alert('Failed to load activities for this trip.');
      }
    }
  };

  const toggleActivities = (tripId) => {
    setShowActivities(prev => ({ ...prev, [tripId]: !prev[tripId] }));
    if (!showActivities[tripId]) {
      fetchActivities(tripId);
    }
  };

  const createTrip = async () => {
    if (budget < 0) {
      alert("Budget must be a positive number");
      return;
    }

    try {
      await api.post('/trips', {
        name: tripName,
        destination,
        start_date: startDate,
        end_date: endDate,
        user_id: userId,
        budget: parseFloat(budget) || 0.0  // Include budget here, ensure it's a number
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


  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript Date
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };


return (
    <div>
      <h1>Manage Trips</h1>
      <button onClick={() => {
        localStorage.removeItem('user_id');
        history.push('/login');
      }}>Logout</button>
      <div>
        <input type="text" placeholder="Trip Name" onChange={(e) => setTripName(e.target.value)} />
        <input type="text" placeholder="Destination" onChange={(e) => setDestination(e.target.value)} />
        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" onChange={(e) => setEndDate(e.target.value)} />
        <input 
          type="number" 
          placeholder="Budget" 
          min="0" 
          step="0.01" 
          onChange={(e) => setBudget(e.target.value)} 
        />
        <button onClick={createTrip}>Create Trip</button>
      </div>
      <h2>Your Trips</h2>
      {trips.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {trips.map(trip => (
            <li key={trip.id} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h3 style={{ margin: '0 10px 0 0' }}>
                  <strong>{trip.name}</strong> - {trip.destination} (
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}, {new Date(trip.start_date).getFullYear()})
                </h3>
                <button onClick={() => toggleActivities(trip.id)}>
                  {fetchActivities[trip.id] ? 'Hide Activities' : 'View Activities'}
                </button>
                <button onClick={() => handleDeleteTrip(trip.id)} style={{ marginLeft: '10px' }}>Delete Trip</button>
              </div>
              <p>Budget: ${trip.budget}</p>
              {showActivities[trip.id] && activities[trip.id] && (
                <ul>
                  {Array.isArray(activities[trip.id]) ? (
                    activities[trip.id]
                      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
                      .map(activity => (
                        <li key={activity.id}>
                          {activity.name} - {activity.date} at {activity.time}, {activity.location}
                          <button onClick={() => handleDeleteActivity(trip.id, activity.id)} style={{ marginLeft: '10px' }}>Delete Activity</button>
                        </li>
                      ))
                  ) : (
                    <li>{activities[trip.id]}</li>
                  )}
                </ul>
              )}
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


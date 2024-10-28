import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';

function TripManager() {
  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const history = useHistory();

  const userId = localStorage.getItem('user_id'); // Get user ID from local storage

  useEffect(() => {
    if (!userId) {
      alert("Please log in to view your trips");
      history.push('/login');
    }
  }, [userId, history]);

  const fetchUserTrips = async () => {
    try {
      const response = await api.get(`/trips?user_id=${userId}`);  // Add user_id to fetch only their trips
      setTrips(response.data);
    } catch (error) {
      alert('Failed to load trips.');
    }
  };

  const createTrip = async () => {
    try {
      await api.post('/trips', {
        name: tripName,
        destination,
        start_date: startDate,
        end_date: endDate,
        user_id: userId  // Send user_id to associate the trip
      });
      fetchUserTrips(); // Refresh trip list after creation
      alert('Trip created successfully!');
    } catch (error) {
      alert('Failed to create trip.');
    }
  };

  useEffect(() => {
    if (userId) fetchUserTrips();
  }, [userId]);

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

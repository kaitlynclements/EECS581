import React, { useState, useEffect } from 'react';
import api from '../services/api';  // Import the API instance

function TripManager() {
  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Fetch trips
  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data);
    } catch (error) {
      alert('Failed to load trips.');
    }
  };

  // Create a new trip
  const createTrip = async () => {
    try {
      await api.post('/trips', {
        name: tripName,
        destination,
        start_date: startDate,
        end_date: endDate,
        user_id: 1,  // In a real application, replace this with the actual logged-in user ID
      });
      fetchTrips(); // Refresh trip list
      alert('Trip created successfully!');
    } catch (error) {
      alert('Failed to create trip.');
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div>
      <h2>Manage Trips</h2>
      <div>
        <input type="text" placeholder="Trip Name" onChange={(e) => setTripName(e.target.value)} />
        <input type="text" placeholder="Destination" onChange={(e) => setDestination(e.target.value)} />
        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={createTrip}>Create Trip</button>
      </div>
      <h3>Existing Trips</h3>
      <ul>
        {trips.map(trip => (
          <li key={trip.id}>{trip.name} - {trip.destination} ({trip.start_date} to {trip.end_date})</li>
        ))}
      </ul>
    </div>
  );
}

export default TripManager;

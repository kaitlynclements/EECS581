import React, { useState, useEffect } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api'; // Import Autocomplete
import api from '../services/api';
import { deleteTrip } from '../services/api';
import { useHistory } from 'react-router-dom';
import MapComponent from './MapComponent'; // Import the Map component
import PDFDownloadButton from './PDFDownloadButton';

function TripManager() {
  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [activities, setActivities] = useState({});
  const [showActivities, setShowActivities] = useState({});
  const [autocomplete, setAutocomplete] = useState(null); // Autocomplete instance
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
      setActivities(prev => ({ 
        ...prev, 
        [tripId]: response.data 
      }));
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities(prev => ({ ...prev, [tripId]: [] }));
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
        latitude,
        longitude,
        start_date: startDate,
        end_date: endDate,
        user_id: userId,
        budget: parseFloat(budget) || 0.0
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
        fetchActivities(tripId);
      } catch (error) {
        alert("Failed to delete activity");
      }
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setDestination(place.formatted_address);
        setLatitude(place.geometry.location.lat());
        setLongitude(place.geometry.location.lng());
      } else {
        alert("Please select a valid location from the suggestions.");
      }
    }
  };

  const calculateExpenses = (tripActivities) => {
    if (!Array.isArray(tripActivities)) return {};
    
    const expenses = {};
    tripActivities.forEach(activity => {
      const category = activity.category || 'Uncategorized';
      expenses[category] = (expenses[category] || 0) + (activity.cost || 0);
    });
    return expenses;
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <h1>Manage Trips</h1>
        <button onClick={() => {
          localStorage.removeItem('user_id');
          history.push('/login');
        }}>Logout</button>
        <div>
          <input
            type="text"
            placeholder="Trip Name"
            onChange={(e) => setTripName(e.target.value)}
          />
          <LoadScript googleMapsApiKey="AIzaSyCbJ9OEK1bSd7DLg2XHOE8zT2PlBxODR1g" libraries={['places']}>
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
              <input
                type="text"
                placeholder="Search Destination"
                style={{ width: '100%', padding: '8px' }}
              />
            </Autocomplete>
          </LoadScript>
          <input
            type="date"
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            onChange={(e) => setEndDate(e.target.value)}
          />
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
              <li key={trip.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ margin: '0' }}>
                    <strong>{trip.name}</strong> - {trip.destination}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => toggleActivities(trip.id)}>
                      {showActivities[trip.id] ? 'Hide Activities' : 'View Activities'}
                    </button>
                    <button onClick={() => handleDeleteTrip(trip.id)}>Delete Trip</button>
                  </div>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <p>Dates: {formatDate(trip.start_date)} - {formatDate(trip.end_date)}, {new Date(trip.start_date).getFullYear()}</p>
                  <p>Budget: ${trip.budget}</p>
                </div>

                {showActivities[trip.id] && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: '0' }}>Activities</h4>
                      {Array.isArray(activities[trip.id]) && activities[trip.id].length > 0 && (
                        <div style={{ 
                          padding: '10px', 
                          backgroundColor: '#4CAF50', 
                          color: 'white', 
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}>
                          <PDFDownloadButton
                            trip={trip}
                            activities={activities[trip.id]}
                            expenses={calculateExpenses(activities[trip.id])}
                          />
                        </div>
                      )}
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {Array.isArray(activities[trip.id]) && activities[trip.id].length > 0 ? (
                        activities[trip.id]
                          .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
                          .map(activity => (
                            <li key={activity.id} style={{ 
                              marginBottom: '8px', 
                              padding: '8px', 
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px'
                            }}>
                              {activity.name} - {activity.date} at {activity.time}, {activity.location}
                              <button 
                                onClick={() => handleDeleteActivity(trip.id, activity.id)}
                                style={{ marginLeft: '10px' }}
                              >
                                Delete Activity
                              </button>
                            </li>
                          ))
                      ) : (
                        <li>No activities created for this trip yet</li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No trips found. Create a new trip to get started!</p>
        )}
      </div>

      <div style={{ width: '30%', marginLeft: '20px' }}>
        <h3>Map</h3>
        <MapComponent width="100%" height="200px" />
      </div>
    </div>
  );
}

export default TripManager;

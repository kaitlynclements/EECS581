import React, { useState, useEffect } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api'; // Import Autocomplete
import api from '../services/api';
import { deleteTrip } from '../services/api';
import { useHistory } from 'react-router-dom';
import MapComponent from './MapComponent'; // Import the Map component

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
  const [showShareForm, setShowShareForm] = useState({});
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
      // Fetch owned trips
      const ownedTripsResponse = await api.get(`/trips?user_id=${userId}`);
      const ownedTrips = ownedTripsResponse.data.map(trip => ({
        ...trip,
        sharedWith: trip.sharedWith || [], // Ensure sharedWith is always an array
      }));
  
      // Fetch shared trips
      const sharedTripsResponse = await api.get(`/users/${userId}/shared-trips`);
      const sharedTrips = sharedTripsResponse.data.map(trip => ({
        ...trip,
        shared: true, // Add a flag for shared trips
      }));
  
      // Combine owned and shared trips
      const allTrips = [...ownedTrips, ...sharedTrips];
      console.log("Trips fetched:", allTrips);
  
      setTrips(allTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      alert('Failed to load trips.');
    }
  };  
  
  

  const toggleShareForm = (tripId) => {
    setShowShareForm((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }));
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

  const handleShareTrip = async (tripId, email) => {
    try {
      const response = await api.post(`/trips/${tripId}/share`, { email });
      alert(response.data.message);
    } catch (error) {
      console.error("Error sharing trip:", error);
      alert("Failed to share trip.");
    }
  };
  
  const ShareForm = ({ tripId }) => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
  
    const handleShare = async () => {
      try {
        setErrorMessage(''); // Clear any previous errors
        await api.post(`/trips/${tripId}/share`, { email });
        alert(`Trip shared with ${email}`);
        setEmail(''); // Clear input
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setErrorMessage('Not a registered user'); // Show error if user is not found
        } else {
          setErrorMessage('Failed to share trip. Please try again.');
        }
      }
    };
  
    return (
      <div style={{ marginTop: '10px' }}>
        <input
          type="email"
          placeholder="Enter user's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleShare}>Share</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    );
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

  const handlePrint = () => {
    const tripData = {
      user: localStorage.getItem('user_email'), // Assume the user's email is stored
      trips,
      activities,
    };
    history.push({
      pathname: '/print',
      state: tripData,
    });
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
      <li key={trip.id} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h3 style={{ margin: '0 10px 0 0' }}>
            <strong>{trip.name}</strong> - {trip.destination} (
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}, {new Date(trip.start_date).getFullYear()})
          </h3>
          <button onClick={() => toggleActivities(trip.id)}>
            {showActivities[trip.id] ? 'Hide Activities' : 'View Activities'}
          </button>
          <button onClick={() => handleDeleteTrip(trip.id)} style={{ marginLeft: '10px' }}>Delete Trip</button>
          <button onClick={() => toggleShareForm(trip.id)} style={{ marginLeft: '10px' }}>
            Share Trip
          </button>
        </div>
        <p>Budget: ${trip.budget}</p>
        <p>
  {trip.shared
    ? `Shared from: ${trip.sharedBy || 'Unknown Owner'}` // For shared trips
    : trip.sharedWith.length > 0
    }
</p>
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
        {showShareForm[trip.id] && <ShareForm tripId={trip.id} />}
      </li>
    ))}
  </ul>
) : (
  <p>No trips found. Create a new trip to get started!</p>
)}


      </div>

      <div style={{ width: '30%', marginLeft: '20px' }}>
        <h3>Map</h3>
        <MapComponent width="100%" height="200px" /> {/* Small map */}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handlePrint}>Print</button>
      </div>
      
    </div>
  );
}

export default TripManager;

import React, { useEffect, useState } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
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
    latitude: null,
    longitude: null,
  }); // Updated state for location details
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null); // Autocomplete instance for location input

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchTripsWithActivities = async () => {
      try {
        const response = await api.get(`/trips?user_id=${userId}`);
        const tripsData = response.data;

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
              return { ...trip, activities: [] };
            }
          })
        );

        setTrips(tripsWithActivities);
        setTripOptions(tripsData);
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

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setActivity((prevActivity) => ({
          ...prevActivity,
          location: place.formatted_address || '',
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        }));
      }
    }
  };

  const onLoadAutocomplete = (auto) => setAutocomplete(auto);

  const handleTripNameChange = async (e) => {
    setTypedTripName(e.target.value);
    const selectedTrip = tripOptions.find((trip) => trip.name === e.target.value);
    if (selectedTrip) {
      try {
        const response = await api.get(`/trips/${selectedTrip.id}`);
        setSelectedTripBudget(response.data.budget);
        setSelectedTripDates({
          startDate: response.data.start_date,
          endDate: response.data.end_date,
        });
      } catch (error) {
        console.error("Error fetching trip details:", error);
      }
    } else {
      setSelectedTripBudget(null);
      setSelectedTripDates({ startDate: '', endDate: '' });
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
        return alert("Activity date must be within the trip date range");
      }

      try {
        const tripId = tripOptions.find((t) => t.name === typedTripName).id;
        const response = await api.post(`/trips/${tripId}/itinerary/activities/create`, newActivity);

        const createdActivity = response.data.activity;

        setTrips((prevTrips) =>
          prevTrips.map((trip) =>
            trip.id === tripId
              ? { ...trip, activities: [...trip.activities, { ...newActivity, id: createdActivity }] }
              : trip
          )
        );

        setActivity({ name: '', date: '', time: '', location: '', latitude: null, longitude: null });
        setTypedTripName('');
        setSelectedTripBudget(null);
      } catch (error) {
        console.error("Error adding activity:", error);
        alert("Failed to add activity.");
      }
    } else {
      alert('Please fill out all fields and select a trip name');
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
            {selectedTripBudget !== null && <h3>Total Budget: ${selectedTripBudget}</h3>}
          </div>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={activity.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={activity.date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Time:</label>
            <input
              type="time"
              name="time"
              value={activity.time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Location:</label>
            <LoadScript googleMapsApiKey="AIzaSyCbJ9OEK1bSd7DLg2XHOE8zT2PlBxODR1g" libraries={['places']}>
              <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={handlePlaceChanged}>
                <input
                  type="text"
                  name="location"
                  value={activity.location}
                  onChange={handleInputChange}
                  placeholder="Search for a location"
                  required
                />
              </Autocomplete>
            </LoadScript>
          </div>
          <button type="submit">Add Activity</button>
        </form>
        {/* Existing trip and activity rendering */}
      </div>
      <div style={{ width: '30%', marginLeft: '20px' }}>
        <h3>Map</h3>
        <MapComponent width="100%" height="200px" />
      </div>
    </div>
  );
};

export default ItineraryManager;

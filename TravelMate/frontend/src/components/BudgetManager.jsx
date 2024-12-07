import React, { useEffect, useState } from 'react';
import api from '../services/api';

function BudgetManager() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [activities, setActivities] = useState([]);
  const [tripDetails, setTripDetails] = useState(null);
  const [activityCosts, setActivityCosts] = useState({});
  const [activityCategories, setActivityCategories] = useState({});

  const userId = localStorage.getItem('user_id');
  const categories = ["Travel", "Food/Drink", "Lodging", "Entertainment", "Other"];


  useEffect(() => {
    const fetchTrips = async () => {
      const userId = localStorage.getItem('user_id');
      try {
        // Fetch owned trips
        const ownedTripsResponse = await api.get(`/trips?user_id=${userId}`);
        const ownedTrips = ownedTripsResponse.data.map((trip) => ({
          ...trip,
          shared: false, // Mark owned trips as not shared
        }));
  
        // Fetch shared trips
        const sharedTripsResponse = await api.get(`/users/${userId}/shared-trips`);
        const sharedTrips = sharedTripsResponse.data.map((trip) => ({
          ...trip,
          shared: true, // Mark as shared
          sharedBy: trip.sharedBy, // Use the sharedBy field returned from backend
        }));
  
        // Combine owned and shared trips
        const allTrips = [...ownedTrips, ...sharedTrips];
        setTrips(allTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
        alert("Failed to load trips.");
      }
    };
  
    fetchTrips();
  }, []);
  

  const fetchTripDetails = async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      setTripDetails(response.data);

      const activitiesResponse = await api.get(`/trips/${tripId}/activities`);
      setActivities(activitiesResponse.data);
      
      const initialCosts = {};
      const initialCategories = {};
      activitiesResponse.data.forEach(activity => {
        initialCosts[activity.id] = activity.cost || 0;
        initialCategories[activity.id] = activity.category || categories[0];
      });
      setActivityCosts(initialCosts);
      setActivityCategories(initialCategories);

    } catch (error) {
      console.error("Error fetching trip details or activities:", error);
      alert("Failed to load trip details.");
    }
  };

  const handleTripChange = (e) => {
    const tripId = e.target.value;
    setSelectedTrip(tripId);

    if (tripId) {
      fetchTripDetails(tripId);
    } else {
      setTripDetails(null);
      setActivities([]);
      setActivityCosts({});
      setActivityCategories({});
    }
  };

  const handleCostChange = (activityId, cost) => {
    setActivityCosts((prevCosts) => ({
      ...prevCosts,
      [activityId]: parseFloat(cost) || 0
    }));
  };

  const handleCategoryChange = (activityId, category) => {
    setActivityCategories((prevCategories) => ({
      ...prevCategories,
      [activityId]: category
    }));
  };

  const saveActivityDetails = async (activityId) => {
    try {
      const data = {
        cost: activityCosts[activityId],
        category: activityCategories[activityId]
      };
      await api.patch(`/trips/${selectedTrip}/activities/${activityId}`, data);
      alert("Activity updated successfully");
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Failed to update activity.");
    }
  };

  // Calculate the total cost of all activities
  const totalCost = Object.values(activityCosts).reduce((sum, cost) => sum + cost, 0);

  // Calculate the total cost per category
  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = 0;
    Object.keys(activityCosts).forEach(activityId => {
      if (activityCategories[activityId] === category) {
        acc[category] += activityCosts[activityId];
      }
    });
    return acc;
  }, {});

  return (
    <div>
      <h1>Budget Manager</h1>
      
      <label htmlFor="tripDropdown">Select a Trip:</label>
      <select id="tripDropdown" value={selectedTrip} onChange={handleTripChange}>
  <option value="">-- Select a Trip --</option>
  {trips.map((trip) => (
    <option key={trip.id} value={trip.id}>
      {trip.name} {trip.shared ? `(Shared by ${trip.sharedBy})` : '(Owned)'}
    </option>
  ))}
</select>

      {tripDetails && (
        <div>
          <h2>Selected Trip Details</h2>
          <p><strong>Destination:</strong> {tripDetails.destination}</p>
          <p><strong>Start Date:</strong> {tripDetails.start_date}</p>
          <p><strong>End Date:</strong> {tripDetails.end_date}</p>
          <p><strong>Budget:</strong> ${tripDetails.budget}</p>

          <h3>Activities</h3>
          {activities.length > 0 ? (
            <ul>
              {activities.map((activity) => (
                <li key={activity.id}>
                  <strong>{activity.name}</strong> - {activity.date} at {activity.time}, {activity.location}
                  <div>
                    <label>Cost: $</label>
                    <input
                      type="number"
                      value={activityCosts[activity.id] || ''}
                      onChange={(e) => handleCostChange(activity.id, e.target.value)}
                      min="0"
                      placeholder="Enter cost"
                    />
                  </div>
                  <div>
                    <label>Category: </label>
                    <select
                      value={activityCategories[activity.id] || categories[0]}
                      onChange={(e) => handleCategoryChange(activity.id, e.target.value)}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => saveActivityDetails(activity.id)}>Update</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No activities for this trip.</p>
          )}

          <h3>Total Cost of Activities: ${totalCost.toFixed(2)}</h3>

          <h3>Cost Breakdown by Category</h3>
          <ul>
            {categories.map(category => (
              <li key={category}>
                <strong>{category}:</strong> ${categoryTotals[category].toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BudgetManager;

import React from 'react';
import { useLocation } from 'react-router-dom';

function Print() {
  const location = useLocation();
  const { state } = location || {};
  const { user, trips, activities } = state || {};

  if (!state) {
    return <p>No data to display. Please navigate here from the Trip Manager.</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>My Trip</h1>
      <p><strong>First Name:</strong> {user?.first_name || 'N/A'}</p>
      <p><strong>Last Name:</strong> {user?.last_name || 'N/A'}</p>
      <p><strong>Email:</strong> {user?.email || 'N/A'}</p>

      <h2>Trips</h2>
      {trips.length > 0 ? (
        trips.map((trip) => (
          <div key={trip.id} style={{ marginBottom: '20px' }}>
            <h3>{trip.name}</h3>
            <p><strong>Budget:</strong> ${trip.budget.toFixed(2)}</p>
            <h4>Activities:</h4>
            {Array.isArray(activities[trip.id]) ? (
              <ul>
                {activities[trip.id].map((activity) => (
                  <li key={activity.id}>
                    {activity.name} - {activity.date} at {activity.time}, {activity.location}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No activities for this trip.</p>
            )}
          </div>
        ))
      ) : (
        <p>No trips found.</p>
      )}
    </div>
  );
}

export default Print;
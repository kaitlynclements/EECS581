/*
Author: Kaitlyn Clements, Elizabeth Soltis
Date: 10/21/2024
Other Sources: Chat GPT
Description: The main React component that acts as the base for other components
*/

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import TripManager from './components/TripManager';
import ItineraryManager from './components/ItineraryManager';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          <Route exact path="/" component={() => <h1>Welcome to TravelMate</h1>} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/trips" component={TripManager} />
          <Route path="/create-itinerary" component={ItineraryManager} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
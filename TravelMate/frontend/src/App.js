/*
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: The main React component that acts as the base for other components
*/

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import TripManager from './components/TripManager';

function App() {
  return (
    <Router>
      <div>
        <h1>TravelMate</h1>
        <Switch>
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/trips" component={TripManager} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;

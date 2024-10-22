1. Directory Structure
  TravelMate/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── models.py
│   ├── controllers/
│   │   ├── user_controller.py
│   │   └── trip_controller.py
│   ├── services/
│   │   └── auth_service.py
│   ├── utils/
│   │   └── db_connection.py
│   └── config.py
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── TripList.jsx
│   │   │   └── Itinerary.jsx
│   │   └── services/
│   │       └── api.js
│   └── package.json
│
└── database/
    └── schema.sql

2. Back-End Layer (Python/Flask)
   This part handles user authentication, trip management, and business logic.
   
  app.py
    This is the entry point of the Flask application
   models.py
     Contains database models for user registration and trip management using SQLAlchemy
   controllers/user_controller.py
     Defines routes for user registration and login
   services/auth_service.py
     Handles authentication logic for user login
   requirements.txt
     Dependencies for the backend

3. Front-End Layer (React.js)
   This part handles the user interface

   src/App.js
     The main React component that acts as the base for other components
   src/components/Register.jsx
     Handles user registration
   src/services.api.js
     Axios configuration for making API requests
   package.json
     Dependencies for the frontend

4. Database Layer (SQL)
   
   schema.sql
     SQL schema for creating tables

5. Deployment Instructions
   To setup and run
   -  Back-End
       1. Navigate to backend folder: cd backend
       2. Install dependencies: pip install -r requirements.txt
       3. Run the server: python app.py
    - Front-End
        1. Navigate to frontend folder: cd frontend
        2. Install dependencies: npm install
        3. Start the React app: npm start

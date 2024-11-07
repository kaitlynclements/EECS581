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


# TravelMate Setup Instructions

## Prerequisites
- **Python 3.x** (for backend)
- **Node.js** and **npm** (for frontend)
- **pip** (Python package manager)

---

## 1. Backend Setup (Flask)

### Step 1: Navigate to the Backend Directory
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
```

### Step 2: Create a Virtual Environment (Optional but Recommended)
It's good practice to use a virtual environment to manage dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On MacOS/Linux
venv\Scripts\activate   # On Windows
```

### Step 3: Install Required Dependencies
Install the necessary Python packages listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### Step 4.0: 
```
pip install flask_sqlalchemy
pip install bcrypt
```

### Step 4: Initialize the Database
Set up the SQLite database by running the `init_db.py` script:
```bash
python init_db.py
```

This script will create the necessary tables in the database.

### Step 5: Run the Flask Server
Once the database is initialized, start the Flask backend server:
```bash
python app.py
```

The backend will be running on `http://127.0.0.1:5000`.

---

## 2. Frontend Setup (React)

### Step 1: Navigate to the Frontend Directory
Open a separate terminal window and navigate to the `frontend` directory:
```bash
cd frontend
```

### Step 2: Install Dependencies
Install the required Node.js packages:
```bash
npm install
```
### Step 3: Install react-router-dom
```bash
npm install react-router-dom
```
### Step 4: Start the React Development Server
Start the frontend development server:
```bash
npm start
```

The React app will be running on `http://localhost:3000`.

---

## 3. Testing the Application

### Step 1: Register a New User
1. Navigate from home to Register through Navigation bar or Visit `http://localhost:3000/register` in your browser.
2. Fill in the email and password fields.
3. Click **Register**.

### Step 2: Log In
1. Navigate from home to Login through Navigation bar or Visit `http://localhost:3000/login`.
2. Enter your registered email and password.
3. Click **Login**.

### Step 3: Create and View Trips
1. After logging in, navigate to trips through Navigation bar or visit `http://localhost:3000/trips`.
2. Fill in the trip name, destination, start date, and end date.
3. Click **Create Trip**.
4. The newly created trip should appear in the list of existing trips.

---

## Conclusion
By following these steps, you can get both the backend and frontend running, initialize the database, and test the full functionality of the **TravelMate** app.

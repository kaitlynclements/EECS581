"""
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Contains database models for user registration and trip management using SQLAlchemy
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Date, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

Base = declarative_base()

# SQLite Database URL
DATABASE_URL = "sqlite:///./travelmate.db"

# Database Engine and Session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SQLAlchemy()

class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(200), nullable=False)

    def __init__(self, trip_id, name, date, time, location):
        self.trip_id = trip_id
        self.name = name
        self.date = date
        self.time = time
        self.location = location

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    
    # Add the relationship to trips
    trips = relationship("Trip", back_populates="user")

class Trip(Base):
    __tablename__ = 'trips'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))  # Foreign key to User model
    
    # Add the relationship to the user
    user = relationship("User", back_populates="trips")

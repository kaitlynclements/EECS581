"""
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Contains database models for user registration and trip management using SQLAlchemy
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    trips = db.relationship("Trip", back_populates="user")

class Trip(db.Model):
    __tablename__ = 'trips'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    destination = db.Column(db.String, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user = db.relationship("User", back_populates="trips")
    itinerary = db.relationship("Itinerary", back_populates="trip", uselist=False)
    activities = db.relationship("Activity", back_populates="trip", cascade="all, delete-orphan")

class Itinerary(db.Model):
    __tablename__ = 'itineraries'
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    activities = db.relationship("Activity", back_populates="itinerary", cascade="all, delete-orphan")
    trip = db.relationship("Trip", back_populates="itinerary")
    
class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    itinerary_id = db.Column(db.Integer, db.ForeignKey('itineraries.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    itinerary = db.relationship("Itinerary", back_populates="activities")



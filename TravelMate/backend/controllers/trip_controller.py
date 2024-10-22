from flask import Blueprint, request, jsonify
from models import Trip, SessionLocal
from datetime import datetime

trip_bp = Blueprint('trip_bp', __name__)

@trip_bp.route('/trips', methods=['GET'])
def get_trips():
    session = SessionLocal()
    trips = session.query(Trip).all()
    session.close()
    return jsonify([{
        'id': trip.id,
        'name': trip.name,
        'destination': trip.destination,
        'start_date': str(trip.start_date),
        'end_date': str(trip.end_date),
        'user_id': trip.user_id
    } for trip in trips])

@trip_bp.route('/trips', methods=['POST'])
def create_trip():
    session = SessionLocal()
    
    # Convert string dates to Python date objects
    start_date = datetime.strptime(request.json['start_date'], '%Y-%m-%d').date()
    end_date = datetime.strptime(request.json['end_date'], '%Y-%m-%d').date()

    new_trip = Trip(
        name=request.json['name'],
        destination=request.json['destination'],
        start_date=start_date,
        end_date=end_date,
        user_id=request.json['user_id']
    )
    
    session.add(new_trip)
    session.commit()
    
    # Manually create the JSON response
    trip_data = {
        'id': new_trip.id,
        'name': new_trip.name,
        'destination': new_trip.destination,
        'start_date': str(new_trip.start_date),
        'end_date': str(new_trip.end_date),
        'user_id': new_trip.user_id
    }
    
    session.close()
    
    return jsonify(trip_data), 201

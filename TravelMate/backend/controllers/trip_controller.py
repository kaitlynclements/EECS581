from flask import Blueprint, request, jsonify
from models import Trip, SessionLocal
from datetime import datetime

trip_bp = Blueprint('trip_bp', __name__)

@trip_bp.route('/trips', methods=['GET'])
def get_user_trips():
    user_id = request.args.get('user_id')  # Get user_id from the request

    if not user_id:
        return jsonify({"error": "User must be logged in to view trips"}), 401

    session = SessionLocal()
    trips = session.query(Trip).filter_by(user_id=user_id).all()  # Filter trips by user_id
    session.close()

    # Format each trip for JSON response
    return jsonify([{
        'id': trip.id,
        'name': trip.name,
        'destination': trip.destination,
        'start_date': str(trip.start_date),
        'end_date': str(trip.end_date),
    } for trip in trips]), 200

@trip_bp.route('/trips', methods=['POST'])
def create_trip():
    session = SessionLocal()

    # Extract and convert data
    user_id = request.json.get('user_id')
    start_date = datetime.strptime(request.json['start_date'], '%Y-%m-%d').date()
    end_date = datetime.strptime(request.json['end_date'], '%Y-%m-%d').date()

    # Create trip with the user's ID
    new_trip = Trip(
        name=request.json['name'],
        destination=request.json['destination'],
        start_date=start_date,
        end_date=end_date,
        user_id=user_id
    )

    session.add(new_trip)
    session.commit()
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

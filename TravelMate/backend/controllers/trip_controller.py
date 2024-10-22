from flask import Blueprint, request, jsonify
from models import Trip, SessionLocal

trip_bp = Blueprint('trip_bp', __name__)

@trip_bp.route('/trips', methods=['GET'])
def get_trips():
    session = SessionLocal()
    trips = session.query(Trip).all()
    session.close()
    return jsonify([trip.__dict__ for trip in trips])

@trip_bp.route('/trips', methods=['POST'])
def create_trip():
    session = SessionLocal()
    new_trip = Trip(
        name=request.json['name'],
        destination=request.json['destination'],
        start_date=request.json['start_date'],
        end_date=request.json['end_date'],
        user_id=request.json['user_id']
    )
    session.add(new_trip)
    session.commit()
    session.close()
    return jsonify(new_trip.__dict__), 201

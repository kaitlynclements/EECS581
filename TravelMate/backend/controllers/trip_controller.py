from flask import Blueprint, request, jsonify
from models import Trip, SessionLocal
from datetime import datetime
from flask import request, jsonify
from models import db, Activity

trip_bp = Blueprint('trip_bp', __name__)

@trip_bp.route('/api/tripslist', methods=['GET'])
def gettripslist():
    # Create a new database session
    session = SessionLocal()
    try:
        # Fetch all trips from the database
        trips = session.query(Trip).all()
        # Convert trips to a list of dictionaries for JSON response
        trip_list = [
            {
                "id": trip.id,
                "name": trip.name,
                "destination": trip.destination,
                "start_date": trip.start_date.strftime('%Y-%m-%d'),
                "end_date": trip.end_date.strftime('%Y-%m-%d')
            }
            for trip in trips
        ]
        return jsonify(trip_list)
    finally:
        session.close()

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


@trip_bp.route('/trips/<int:trip_id>/itinerary', methods=['GET'])
def get_itinerary(trip_id):
    # Query to fetch all activities linked to the specific trip
    activities = Activity.query.filter_by(trip_id=trip_id).all()
    if not activities:
        return jsonify({"message": "No activities found for this trip."}), 404

    result = [
        {
            'id': activity.id,
            'name': activity.name,
            'date': activity.date.strftime('%Y-%m-%d'),
            'time': activity.time.strftime('%H:%M'),
            'location': activity.location
        } for activity in activities
    ]

    return jsonify(result), 200

# Create a new activity for a trip's itinerary
@trip_bp.route('/trips/<int:trip_id>/itinerary/activities', methods=['POST'])
def create_activity(trip_id):
    data = request.get_json()
    try:
        activity = Activity(
            trip_id=trip_id,
            name=data['name'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            time=datetime.strptime(data['time'], '%H:%M').time(),
            location=data['location']
        )
        db.session.add(activity)
        db.session.commit()
        return jsonify({'message': 'Activity created successfully', 'activity': activity.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Get all activities for a trip's itinerary
@trip_bp.route('/trips/<int:trip_id>/itinerary/activities', methods=['GET'])
def get_activities(trip_id):
    activities = Activity.query.filter_by(trip_id=trip_id).all()
    result = [
        {
            'id': activity.id,
            'name': activity.name,
            'date': activity.date.strftime('%Y-%m-%d'),
            'time': activity.time.strftime('%H:%M'),
            'location': activity.location
        } for activity in activities
    ]
    return jsonify(result), 200

# Delete an activity from a trip's itinerary
@trip_bp.route('/trips/<int:trip_id>/itinerary/activities/<int:activity_id>', methods=['DELETE'])
def delete_activity(trip_id, activity_id):
    # Make sure the activity belongs to the specified trip
    activity = Activity.query.filter_by(id=activity_id, trip_id=trip_id).first()
    if activity is None:
        return jsonify({'error': 'Activity not found or does not belong to the specified trip'}), 404

    db.session.delete(activity)
    db.session.commit()
    return jsonify({'message': 'Activity deleted successfully'}), 200

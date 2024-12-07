from flask import Blueprint, request, jsonify
from models import db, Trip, Activity, User, trip_users
from datetime import datetime

trip_bp = Blueprint('trip_bp', __name__)

@trip_bp.route('/api/tripslist', methods=['GET'])
def gettripslist():
    trips = Trip.query.all()
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


@trip_bp.route('/trips', methods=['POST', 'GET'])
def create_trip():
    if request.method == 'POST':
        user_id = request.json.get('user_id')
        start_date = datetime.strptime(request.json['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(request.json['end_date'], '%Y-%m-%d').date()
        data = request.get_json()
        # Extract and validate budget
        budget = data.get('budget', 0.0)
        if not isinstance(budget, (int, float)) or budget < 0:
            return {"error": "Budget must be a positive number"}, 400

        new_trip = Trip(
            name=request.json['name'],
            destination=request.json['destination'],
            start_date=start_date,
            end_date=end_date,
            user_id=user_id,
            budget=budget # add budget feature here
        )

        db.session.add(new_trip)
        db.session.commit()
        trip_data = {
            'id': new_trip.id,
            'name': new_trip.name,
            'destination': new_trip.destination,
            'start_date': str(new_trip.start_date),
            'end_date': str(new_trip.end_date),
            'user_id': new_trip.user_id,
            'budget': new_trip.budget # add budget here
        }

        return jsonify(trip_data), 201

    elif request.method == 'GET':
        user_id = request.args.get('user_id')

        if not user_id:
            return jsonify({"error": "User must be logged in to view trips"}), 401

        trips = Trip.query.filter_by(user_id=user_id).all()

        return jsonify([{
            'id': trip.id,
            'name': trip.name,
            'destination': trip.destination,
            'start_date': str(trip.start_date),
            'end_date': str(trip.end_date),
            'user_id': trip.user_id,
            'budget': trip.budget
        } for trip in trips]), 200

@trip_bp.route('/trips/<int:trip_id>/itinerary', methods=['GET'])
def get_itinerary(trip_id):
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

@trip_bp.route('/trips/<int:trip_id>/itinerary/activities/create', methods=['POST'])
def create_activity(trip_id):
    data = request.get_json()
    try:
        trip = Trip.query.get(trip_id)
        if not trip:
            return jsonify({'error': 'Trip not found'}), 404

        # Parse the activity date
        activity_date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        # Validate the activity date is within the trip's date range
        if activity_date < trip.start_date or activity_date > trip.end_date:
            return jsonify({'error': 'Activity date must be within the trip date range'}), 400
        
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

@trip_bp.route('/trips/<int:trip_id>/itinerary/activities/<int:activity_id>', methods=['DELETE'])
def delete_activity(trip_id, activity_id):
    activity = Activity.query.filter_by(id=activity_id, trip_id=trip_id).first()
    if activity is None:
        return jsonify({'error': 'Activity not found or does not belong to the specified trip'}), 404

    db.session.delete(activity)
    db.session.commit()
    return jsonify({'message': 'Activity deleted successfully'}), 200

@trip_bp.route('/trips/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    trip = Trip.query.get(trip_id)
    if trip is None:
        return jsonify({'error': 'Trip not found'}), 404

    db.session.delete(trip)
    db.session.commit()
    return jsonify({'message': 'Trip deleted successfully'}), 200

@trip_bp.route('/trips/<int:trip_id>/activities', methods=['GET'])
def get_trip_activities(trip_id):
    activities = Activity.query.filter_by(trip_id=trip_id).all()
    if not activities:
        return jsonify({"message": "No activities found for this trip."}), 404

    result = [
        {
            'id': activity.id,
            'name': activity.name,
            'date': activity.date.strftime('%Y-%m-%d'),
            'time': activity.time.strftime('%H:%M'),
            'location': activity.location,
            'cost': activity.cost,
            'category': activity.category
        } for activity in activities
    ]
    return jsonify(result), 200

@trip_bp.route('/trips/<int:trip_id>', methods=['GET'])
def get_trip(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    trip_data = {
        'id': trip.id,
        'name': trip.name,
        'destination': trip.destination,
        'start_date': trip.start_date.strftime('%Y-%m-%d'),
        'end_date': trip.end_date.strftime('%Y-%m-%d'),
        'budget': trip.budget
    }
    return jsonify(trip_data), 200

@trip_bp.route('/trips/<int:trip_id>/activities/<int:activity_id>', methods=['PATCH'])
def update_activity(trip_id, activity_id):
    data = request.get_json()
    activity = Activity.query.filter_by(id=activity_id, trip_id=trip_id).first()

    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    # Update cost and category if provided in the request
    if 'cost' in data:
        activity.cost = data['cost']
    if 'category' in data:
        activity.category = data['category']

    db.session.commit()
    return jsonify({"message": "Activity updated successfully"}), 200


@trip_bp.route('/trips/<int:trip_id>/share', methods=['POST'])
def share_trip(trip_id):
    data = request.get_json()
    user_email = data.get('email')

    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    user_to_share = User.query.filter_by(email=user_email).first()
    if not user_to_share:
        return jsonify({"error": "User not found"}), 404

    # Prevent sharing with self
    if user_to_share.id == trip.user_id:
        return jsonify({"error": "You cannot share a trip with yourself."}), 400

    # Add the user to the trip's shared users
    if user_to_share not in trip.users:
        trip.users.append(user_to_share)
        try:
            db.session.commit()
            # Return updated shared users list
            shared_users = [
                {"id": user.id, "name": f"{user.first_name} {user.last_name}", "email": user.email}
                for user in trip.users if user.id != trip.user_id
            ]
            return jsonify({
                "message": f"Trip shared with {user_to_share.first_name} {user_to_share.last_name}!",
                "sharedUsers": shared_users
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to share trip."}), 500

    return jsonify({"message": "User already has access to this trip."}), 200


@trip_bp.route('/users/<int:user_id>/shared-trips', methods=['GET'])
def get_shared_trips(user_id):
    # Check if the user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Query trips shared with the user
    shared_trips = db.session.query(Trip).join(trip_users).filter(trip_users.c.user_id == user_id).all()

    # Prepare response with sharedBy information
    result = []
    for trip in shared_trips:
        owner = User.query.get(trip.user_id)  # Fetch the trip owner
        result.append({
            "id": trip.id,
            "name": trip.name,
            "destination": trip.destination,
            "start_date": trip.start_date.strftime('%Y-%m-%d'),
            "end_date": trip.end_date.strftime('%Y-%m-%d'),
            "budget": trip.budget,
            "sharedBy": f"{owner.first_name} {owner.last_name}",  # Include owner details
        })

    return jsonify(result), 200

@trip_bp.route('/trips', methods=['GET'])
def get_owned_trips():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    trips = Trip.query.filter_by(user_id=user_id).all()

    result = []
    for trip in trips:
        # Fetch all users the trip is shared with
        shared_users = [
            f"{user.first_name} {user.last_name}"  # Format user names
            for user in trip.users if user.id != trip.user_id
        ]
        result.append({
            "id": trip.id,
            "name": trip.name,
            "destination": trip.destination,
            "start_date": trip.start_date.strftime('%Y-%m-%d'),
            "end_date": trip.end_date.strftime('%Y-%m-%d'),
            "budget": trip.budget,
            "sharedWith": shared_users  # Include shared users
        })

    return jsonify(result), 200


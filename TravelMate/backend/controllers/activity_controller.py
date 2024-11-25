from flask import Blueprint, request, jsonify
from models import db, Activity
from datetime import datetime

activity_bp = Blueprint('activity_bp', __name__)

@activity_bp.route('/activities', methods=['POST'])
def create_activity():
    trip_id = request.json.get('trip_id')
    name = request.json.get('name')
    date = request.json.get('date')
    time = request.json.get('time')
    location = request.json.get('location')

    new_activity = Activity(
        trip_id=trip_id,
        name=name,
        date=datetime.strptime(date, '%Y-%m-%d').date(),
        time=datetime.strptime(time, '%H:%M').time(),
        location=location
    )

    db.session.add(new_activity)
    db.session.commit()
    return jsonify({"message": "Activity created successfully!"}), 201

@activity_bp.route('/trips/<int:trip_id>/activities', methods=['GET'])
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
            'location': activity.location
        } for activity in activities
    ]
    return jsonify(result), 200

@activity_bp.route('/activities/<int:activity_id>', methods=['PUT'])
def update_activity(activity_id):
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({"error": "Activity not found"}), 404

    data = request.get_json()
    if 'name' in data:
        activity.name = data['name']
    if 'date' in data:
        activity.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    if 'time' in data:
        activity.time = datetime.strptime(data['time'], '%H:%M').time()
    if 'location' in data:
        activity.location = data['location']

    try:
        db.session.commit()
        return jsonify({"message": "Activity updated successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update activity"}), 500

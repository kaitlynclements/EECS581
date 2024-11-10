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

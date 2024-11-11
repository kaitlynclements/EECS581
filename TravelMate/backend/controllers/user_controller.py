"""
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Defines routes for user registration and login
"""

from flask import Blueprint, request, jsonify
from models import db, User  # Ensure db is imported correctly
from werkzeug.security import generate_password_hash, check_password_hash  # Secure hashing functions

user_bp = Blueprint('user_bp', __name__)


@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = generate_password_hash(data.get('password'))  # Use secure password hashing

    # Check for an existing user
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    # Create and add a new user
    new_user = User(first_name=first_name, last_name=last_name, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201


@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Query the user by email
    user = User.query.filter_by(email=email).first()

    # Check password and respond accordingly
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "user_id": user.id}), 200

@user_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email
    })


@user_bp.route('/profile/<user_id>', methods=['PUT'])
def update_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get the fields to update
    data = request.get_json()
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        user.email = data['email']

    try:
        db.session.commit()
        return jsonify({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update profile"}), 500

@user_bp.route('/profile/<user_id>/change-password', methods=['PUT'])
def change_password(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    # Check if the current password matches
    if not check_password_hash(user.password, current_password):
        return jsonify({"error": "Incorrect current password"}), 400

    # Hash the new password and update it
    user.password = generate_password_hash(new_password)

    try:
        db.session.commit()
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to change password"}), 500


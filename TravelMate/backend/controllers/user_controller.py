"""
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Defines routes for user registration and login
"""

from flask import Blueprint, request, jsonify
from models import User, SessionLocal
from passlib.hash import bcrypt

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    first_name = data['first name']
    last_name = data['last name']
    email = data['email']
    password = bcrypt.hash(data['password'])
    
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    new_user = User(first_name=first_name, last_name=last_name, email=email, password=password)
    db.add(new_user)
    db.commit()
    return jsonify({"message": "User registered successfully"}), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']
    
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not bcrypt.verify(password, user.password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    return jsonify({"message": "Login successful"}), 200

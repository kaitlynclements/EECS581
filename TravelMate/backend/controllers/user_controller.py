from flask import Blueprint, request, jsonify
from models import User, SessionLocal
from passlib.hash import bcrypt

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data['email']
    password = bcrypt.hash(data['password'])
    
    db = SessionLocal()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    new_user = User(email=email, password=password)
    db.add(new_user)
    db.commit()
    return jsonify({"message": "User registered successfully"}), 201

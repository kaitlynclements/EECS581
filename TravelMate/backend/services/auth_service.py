"""
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Handles authentication logic for user login
"""

from models import User, SessionLocal
from passlib.hash import bcrypt

def authenticate_user(email, password):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user and bcrypt.verify(password, user.password):
        return user
    return None

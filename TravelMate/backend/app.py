"""
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Entry point of the Flask application
"""
from flask import Flask
from flask_cors import CORS
from models import db
from controllers.user_controller import user_bp
from controllers.trip_controller import trip_bp
from controllers.activity_controller import activity_bp
import os

app = Flask(__name__)
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../database/travelmate.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the Flask app
db.init_app(app)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Register Blueprints
app.register_blueprint(user_bp)
app.register_blueprint(trip_bp)
app.register_blueprint(activity_bp)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Ensure tables are created
    app.run(debug=True)

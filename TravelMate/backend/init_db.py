# init_db.py
from models import db
from flask import Flask
import os

app = Flask(__name__)
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../database/travelmate.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Initialize the database
with app.app_context():
    db.create_all()
    print("Database tables created.")
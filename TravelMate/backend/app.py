"""
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Entry point of the Flask application
"""

from flask import Flask
from controllers.user_controller import user_bp
from controllers.trip_controller import trip_bp

app = Flask(__name__)
app.register_blueprint(user_bp)
app.register_blueprint(trip_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)

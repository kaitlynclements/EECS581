"""
Author: Kaitlyn Clements
Date: 10/21
Other Sources: Chat GPT
Description: Manages databse connections
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///travelmate.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

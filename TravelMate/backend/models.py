"""
Author: Kaitlyn Clements
Date: 10/21/2024
Other Sources: Chat GPT
Description: Contains database models for user registration and trip management using SQLAlchemy
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

class Trip(Base):
    __tablename__ = 'trips'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship('User', back_populates='trips')

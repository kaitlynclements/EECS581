# init_db.py
from models import Base, engine

# This will create all the tables in the database defined by the models
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

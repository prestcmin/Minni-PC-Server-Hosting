from .database import Base, engine
from .models.database import Server


def initialize_database():
    Base.metadata.create_all(bind=engine)

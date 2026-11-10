import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.database import Base


@pytest.fixture
def database():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as database:
        yield database

    Base.metadata.drop_all(engine)

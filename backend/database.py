from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from model import Base ,expanse

engine = create_engine("sqlite:///./test.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()   
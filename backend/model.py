from sqlalchemy import Column, Integer, String,Float,Date,ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import date

Base = declarative_base()
class user(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    email = Column(String,unique=True)
    password_hash = Column(String) 


class expanse(Base):
    __tablename__ = "expanse"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount= Column(Float, nullable=True)   
    category=Column(String, nullable=False)
    created_at = Column(Date, default=date.today)
    user_id = Column(Integer, ForeignKey("user.id"))
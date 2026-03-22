from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from model import *
from pydantic import BaseModel
from database import get_db
from sqlalchemy.exc import IntegrityError
from passlib.hash import argon2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- SCHEMAS --------------------

class expansedelete(BaseModel):
    id: int
    user_id: int   # 🔥 ADD

class expanseupdate(BaseModel):
    id: int
    newdescription: str
    newamount: int
    newcategory: str
    user_id: int   # 🔥 ADD

class expanseCreate(BaseModel):
    description: str
    amount: float
    category: str
    user_id: int

class LoginRequest(BaseModel):
    useremail: str
    userpassword: str


# -------------------- ROUTES --------------------

@app.get("/")
def root():
    return {"message": "Hello World"}


# ➕ CREATE EXPENSE
@app.post("/exp/")
def create_item(exp: expanseCreate, db: Session = Depends(get_db)):
    db_item = expanse(
        description=exp.description,
        amount=exp.amount,
        category=exp.category,
        user_id=exp.user_id
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item


# 📊 GET USER EXPENSES
@app.get("/see/{user_id}")
def get_tasks(user_id: int, db: Session = Depends(get_db)):
    tasks = db.query(expanse).filter(expanse.user_id == user_id).all()
    return tasks


# 👤 SIGNUP
@app.post("/signup/")
def get_newuser(request: LoginRequest, db: Session = Depends(get_db)):
    email0 = request.useremail
    password0 = request.userpassword

    usertast = db.query(user).filter(user.email == email0).first()
    if usertast:
        return {"error": "Email already exists"}

    if len(password0) > 72:
        return {"error": "Password too long"}

    hashed_password = argon2.hash(password0)

    newuser_db = user(email=email0, password_hash=hashed_password)

    try:
        db.add(newuser_db)
        db.commit()
        db.refresh(newuser_db)
    except IntegrityError:
        db.rollback()
        return {"error": "Email already exists"}

    return {"message": "Signup successful"}


# 🔐 LOGIN
@app.post("/login/")
def get_login(request: LoginRequest, db: Session = Depends(get_db)):
    userck = db.query(user).filter(user.email == request.useremail).first()

    if userck and argon2.verify(request.userpassword, userck.password_hash):
        return {
            "message": "Login successful",
            "user_id": userck.id
        }

    return {"error": "Invalid email or password"}


# ✏️ UPDATE EXPENSE (PROTECTED)
@app.post("/update/")
def get_update(request: expanseupdate, db: Session = Depends(get_db)):

    expck = db.query(expanse).filter(
        expanse.id == request.id,
        expanse.user_id == request.user_id   # 🔥 SECURITY CHECK
    ).first()

    if not expck:
        return {"error": "Expense not found or not yours"}

    expck.description = request.newdescription
    expck.amount = request.newamount
    expck.category = request.newcategory

    db.commit()
    db.refresh(expck)

    return {"status": "updated"}


# 🗑️ DELETE EXPENSE (PROTECTED)
@app.post("/delete/")
def get_delete(request: expansedelete, db: Session = Depends(get_db)):

    expck = db.query(expanse).filter(
        expanse.id == request.id,
        expanse.user_id == request.user_id   # 🔥 SECURITY CHECK
    ).first()

    if not expck:
        return {"error": "Expense not found or not yours"}

    db.delete(expck)
    db.commit()

    return {"status": "deleted"}


#uvicorn main:app --reload
#.\venv\Scripts\Activate
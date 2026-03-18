from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ MongoDB
MONGO_URL = "mongodb+srv://rohithpabba:Rohith%405168@cluster0.heuj8vq.mongodb.net/parking_db?retryWrites=true&w=majority"

client = AsyncIOMotorClient(MONGO_URL)
db = client["parking_db"]

# Models
class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class LoginModel(BaseModel):
    email: str
    password: str

# Routes
@app.get("/api/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    await db.users.insert_one(user.dict())
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
async def login(user: LoginModel):
    existing = await db.users.find_one({"email": user.email})

    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    if existing["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return {"message": "Login successful"}

# Shutdown
@app.on_event("shutdown")
async def shutdown_db():
    client.close()

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
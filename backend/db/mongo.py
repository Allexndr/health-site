from pymongo import MongoClient
from app.config import MONGODB_URI

client = MongoClient(MONGODB_URI)
db = client["med"]  # Название вашей базы данных 
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// For demo purposes, we'll make MongoDB optional
const USE_MONGODB = MONGODB_URI && MONGODB_URI !== 'demo';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  // If no MongoDB URI provided, return null for demo mode
  if (!USE_MONGODB) {
    console.log('Demo mode: MongoDB not configured');
    return null;
  }

  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    try {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return null;
    }
  }
  
  try {
  cached.conn = await cached.promise;
  return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return null;
  }
} 
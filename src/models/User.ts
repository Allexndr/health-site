import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'doctor' | 'staff';

export interface IUser extends Document {
  email: string;
  name?: string;
  password: string;
  role: UserRole;
  clinicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'staff'], default: 'doctor' },
  clinicId: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 
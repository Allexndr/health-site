import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  address: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<IClinic>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Clinic || mongoose.model<IClinic>('Clinic', ClinicSchema); 
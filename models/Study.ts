import mongoose, { Schema, Document } from 'mongoose';

export interface IStudy extends Document {
  description?: string;
  date: Date;
  patientId: string;
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudySchema = new Schema<IStudy>({
  description: { type: String },
  date: { type: Date, required: true },
  patientId: { type: String, required: true },
  clinicId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Study || mongoose.model<IStudy>('Study', StudySchema); 
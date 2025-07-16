import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  url: string;
  studyId: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>({
  url: { type: String, required: true },
  studyId: { type: String, required: true },
  uploadedBy: { type: String },
}, { timestamps: true });

export default mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema); 
import mongoose, { Schema, Document } from 'mongoose';

export interface IImageShare extends Document {
  imageId: string;
  fromClinicId: string;
  toClinicId: string;
  sharedBy: string;
  shareType: 'view' | 'consultation' | 'transfer';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt?: Date;
  requestMessage?: string;
  responseMessage?: string;
  consultationResult?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ImageShareSchema = new Schema<IImageShare>({
  imageId: { type: String, required: true },
  fromClinicId: { type: String, required: true },
  toClinicId: { type: String, required: true },
  sharedBy: { type: String, required: true },
  shareType: { 
    type: String, 
    enum: ['view', 'consultation', 'transfer'], 
    default: 'view' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'expired'], 
    default: 'pending' 
  },
  expiresAt: { type: Date },
  requestMessage: { type: String },
  responseMessage: { type: String },
  consultationResult: { type: String },
}, { timestamps: true });

// Индексы для быстрого поиска
ImageShareSchema.index({ imageId: 1 });
ImageShareSchema.index({ fromClinicId: 1 });
ImageShareSchema.index({ toClinicId: 1 });
ImageShareSchema.index({ status: 1 });

export default mongoose.models.ImageShare || mongoose.model<IImageShare>('ImageShare', ImageShareSchema); 
import { apiClient, ImageUploadRequest } from '@/lib/api'
import { z } from 'zod'

// Supported image types and their MIME types
const SUPPORTED_TYPES = {
  'image/dicom': ['.dcm'],
  'image/x-dicom': ['.dcm'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
} as const

// Maximum file size (1GB as per requirements)
const MAX_FILE_SIZE = 1024 * 1024 * 1024

// Validation schema for file metadata
const fileMetadataSchema = z.object({
  filename: z.string(),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  studyDate: z.string().optional(),
  modality: z.string().optional(),
  clinicId: z.string(),
  uploadedBy: z.string(),
})

export type FileMetadata = z.infer<typeof fileMetadataSchema>

export class StorageService {
  private validateFileType(file: File): boolean {
    return Object.keys(SUPPORTED_TYPES).includes(file.type)
  }

  private validateFileSize(file: File): boolean {
    return file.size <= MAX_FILE_SIZE
  }

  async uploadFile(file: File, metadata: FileMetadata): Promise<string> {
    try {
      // Validate file type and size
      if (!this.validateFileType(file)) {
        throw new Error('Unsupported file type')
      }

      if (!this.validateFileSize(file)) {
        throw new Error('File size exceeds maximum limit (1GB)')
      }

      // Validate metadata
      fileMetadataSchema.parse(metadata)

      // Upload to Cloudinary via API
      const uploadRequest: ImageUploadRequest = {
        file,
        clinic_id: metadata.clinicId,
        patient_id: metadata.patientId,
        patient_name: metadata.patientName,
        study_date: metadata.studyDate,
        modality: metadata.modality,
      }

      const response = await apiClient.uploadImage(uploadRequest)
      
      if (response.error) {
        throw new Error(response.error)
      }

      return response.data?.url || ''
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid metadata: ' + error.errors.map(e => e.message).join(', '))
      }
      throw error
    }
  }

  async getFile(fileUrl: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    // For now, we'll just return the URL since images are served directly from Cloudinary
    throw new Error('Use image URL directly from Cloudinary')
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // File deletion is handled by the API when deleting image records
    return
  }

  async listFiles(clinicId: string, options?: {
    patientId?: string
    modality?: string
    startDate?: Date
    endDate?: Date
  }): Promise<{ url: string; metadata: FileMetadata }[]> {
    const response = await apiClient.getClinicImages(clinicId)
    
    if (response.error) {
      throw new Error(response.error)
    }

    const images = response.data || []
    
    // Convert API response to expected format
    return images.map(image => ({
      url: image.file_path, // This will be the Cloudinary URL
      metadata: {
        filename: image.filename,
        patientId: image.patient_id,
        patientName: image.patient_name,
        studyDate: image.study_date,
        modality: image.modality,
        clinicId: image.clinic_id,
        uploadedBy: image.uploaded_by,
      }
    }))
  }
} 
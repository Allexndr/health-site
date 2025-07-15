import sharp from 'sharp'
import { z } from 'zod'

// Supported image types and their MIME types
const SUPPORTED_TYPES = {
  'image/dicom': ['.dcm'],
  'image/x-dicom': ['.dcm'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
} as const

// Maximum file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024

// Validation schema for file metadata
const fileMetadataSchema = z.object({
  filename: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  studyDate: z.string(),
  modality: z.string(),
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

  private async compressImage(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // If it's a DICOM file, don't compress it
    if (file.type.includes('dicom')) {
      return buffer
    }

    // For other image types, compress using sharp
    return sharp(buffer)
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toBuffer()
  }

  async uploadFile(file: File, metadata: FileMetadata): Promise<string> {
    try {
      // Validate file type and size
      if (!this.validateFileType(file)) {
        throw new Error('Unsupported file type')
      }

      if (!this.validateFileSize(file)) {
        throw new Error('File size exceeds maximum limit')
      }

      // Validate metadata
      fileMetadataSchema.parse(metadata)

      // Compress image if needed
      const compressedBuffer = await this.compressImage(file)

      // TODO: Implement actual file storage
      // For MVP, we'll just return a mock URL
      // In production, this would upload to a secure storage service
      const mockUrl = `https://storage.example.com/${metadata.clinicId}/${metadata.filename}`

      return mockUrl
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid metadata: ' + error.errors.map(e => e.message).join(', '))
      }
      throw error
    }
  }

  async getFile(fileUrl: string): Promise<{ buffer: Buffer; metadata: FileMetadata }> {
    // TODO: Implement actual file retrieval
    // For MVP, we'll just return a mock response
    throw new Error('Not implemented')
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // TODO: Implement actual file deletion
    // For MVP, we'll just return successfully
    return
  }

  async listFiles(clinicId: string, options?: {
    patientId?: string
    modality?: string
    startDate?: Date
    endDate?: Date
  }): Promise<{ url: string; metadata: FileMetadata }[]> {
    // TODO: Implement actual file listing
    // For MVP, we'll just return an empty array
    return []
  }
} 
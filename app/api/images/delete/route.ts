import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { StorageService } from '@/lib/services/storage'

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get file URL from request body
    const { fileUrl } = await request.json()
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'No file URL provided' },
        { status: 400 }
      )
    }

    // Verify the file belongs to the user's clinic
    if (!fileUrl.includes(user.clinicId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete file
    const storageService = new StorageService()
    await storageService.deleteFile(fileUrl)

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
} 
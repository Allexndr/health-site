const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface LoginRequest {
  username: string
  password: string
}

interface TokenResponse {
  access_token: string
  token_type: string
}

interface Clinic {
  _id: string
  name: string
  login: string
}

interface Image {
  id: string
  filename: string
  file_path: string
  mime_type: string
  clinic_id: string
  uploaded_by: string
  created_at: string
  patient_id?: string
  patient_name?: string
  study_date?: string
  modality?: string
}

interface ImageShare {
  id: string
  imageId: string
  fromClinicId: string
  toClinicId: string
  sharedBy: string
  shareType: 'view' | 'consultation' | 'transfer'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  expiresAt?: string
  requestMessage?: string
  responseMessage?: string
  consultationResult?: string
  createdAt: string
  updatedAt: string
}

interface ShareImageRequest {
  imageId: string
  toClinicId: string
  shareType: 'view' | 'consultation' | 'transfer'
  requestMessage?: string
  expiresAt?: string
}

interface ShareResponse {
  shareId: string
  status: 'pending' | 'approved' | 'rejected'
  responseMessage?: string
}

interface ImageUploadRequest {
  file: File
  clinic_id: string
  patient_id?: string
  patient_name?: string
  study_date?: string
  modality?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.token = this.getStoredToken()
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
    this.token = token
  }

  private removeStoredToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private async uploadFile(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<any>> {
    const url = `${this.baseUrl}${endpoint}`
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.detail || 'Login failed' }
    }

    const data = await response.json()
    this.setStoredToken(data.access_token)
    return { data }
  }

  async getCurrentClinic(): Promise<ApiResponse<Clinic>> {
    return this.request<Clinic>('/auth/me')
  }

  logout(): void {
    this.removeStoredToken()
  }

  // Image methods
  async getClinicImages(clinicId: string): Promise<ApiResponse<Image[]>> {
    return this.request<Image[]>(`/images/list`)
  }

  async uploadImage(data: ImageUploadRequest): Promise<ApiResponse<any>> {
    return this.uploadFile('/images/cloudinary/upload', data.file, {
      clinic_id: data.clinic_id,
      patient_id: data.patient_id,
      patient_name: data.patient_name,
      study_date: data.study_date,
      modality: data.modality,
    })
  }

  async getImage(imageId: string): Promise<ApiResponse<Image>> {
    return this.request<Image>(`/images/${imageId}`)
  }

  async deleteImage(imageId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/images/${imageId}`, {
      method: 'DELETE',
    })
  }

  async downloadImage(imageId: string): Promise<string> {
    return `${this.baseUrl}/images/${imageId}/download`
  }

  // Clinic methods
  async getClinics(): Promise<ApiResponse<Clinic[]>> {
    return this.request<Clinic[]>('/clinics')
  }

  async getClinic(clinicId: string): Promise<ApiResponse<Clinic>> {
    return this.request<Clinic>(`/clinics/${clinicId}`)
  }

  // Image sharing methods
  async shareImage(shareRequest: ShareImageRequest): Promise<ApiResponse<ImageShare>> {
    return this.request<ImageShare>('/images/share', 'POST', shareRequest)
  }

  async getImageShares(type: 'outgoing' | 'incoming'): Promise<ApiResponse<ImageShare[]>> {
    return this.request<ImageShare[]>(`/images/shares/by-type/${type}`)
  }

  async respondToShare(shareId: string, response: ShareResponse): Promise<ApiResponse<ImageShare>> {
    return this.request<ImageShare>(`/images/shares/${shareId}/respond`, 'POST', response)
  }

  async getSharedImages(): Promise<ApiResponse<Image[]>> {
    return this.request<Image[]>('/images/shared')
  }

  async revokeShare(shareId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/images/shares/${shareId}`, 'DELETE')
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.token
  }

  getToken(): string | null {
    return this.token
  }
}

export const apiClient = new ApiClient()
export type { 
  ApiResponse, 
  LoginRequest, 
  TokenResponse, 
  Clinic, 
  Image, 
  ImageUploadRequest,
  ImageShare,
  ShareImageRequest,
  ShareResponse
} 
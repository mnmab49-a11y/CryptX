/// <reference types="vite/client" />
// CryptX API Client Service

function resolveApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL?.trim();
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
  }

  // Only allow localhost fallback during local development mode (vite dev server)
  if ((import.meta as any).env?.DEV) {
    return 'http://localhost:8000/api/v1';
  }

  // In production builds (e.g. Vercel deployment), do NOT silently fallback to localhost!
  return '';
}

export const API_BASE_URL = resolveApiBaseUrl();

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface TextEncryptPayload {
  plaintext: string;
  algorithm?: string;
}

export interface TextEncryptResult {
  ciphertext: string;
  nonce: string;
  tag: string;
  wrapped_dek: string;
  algorithm: string;
  sha256_hash: string;
}

export interface TextDecryptPayload {
  ciphertext: string;
  nonce: string;
  tag: string;
  wrapped_dek: string;
}

export interface TextDecryptResult {
  plaintext: string;
  sha256_hash: string;
  verified: boolean;
}

export interface VaultFileItem {
  id: string;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  file_size: number;
  encrypted_size: number;
  category: string;
  encryption_algorithm: string;
  nonce: string;
  authentication_tag: string;
  sha256_hash: string;
  created_at: string;
  updated_at: string;
}

export interface VaultSummary {
  total_files: number;
  total_storage_bytes: number;
  total_operations: number;
  recent_files: VaultFileItem[];
}

export interface ActivityItem {
  id: string;
  operation_type: string;
  resource_name?: string;
  status: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface ActivityListResult {
  items: ActivityItem[];
  total: number;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('cryptx_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('cryptx_token', token);
    } else {
      localStorage.removeItem('cryptx_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('cryptx_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!API_BASE_URL) {
      throw new Error(
        'CryptX Backend API is not configured. Please set the VITE_API_BASE_URL environment variable in your Vercel project settings to your deployed FastAPI backend URL.'
      );
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});

    const token = this.getToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (networkError: any) {
      throw new Error(
        `Unable to connect to CryptX Backend API (${API_BASE_URL}). Please verify that the backend server is running and accessible.`
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        typeof responseData === 'object' && responseData !== null && responseData.detail
          ? responseData.detail
          : response.statusText || 'Request failed';
      throw new Error(errorMsg);
    }

    return responseData as T;
  }

  // --- Auth APIs ---
  async register(data: { full_name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // --- Cryptography APIs ---
  async encryptText(payload: TextEncryptPayload): Promise<TextEncryptResult> {
    return this.request<TextEncryptResult>('/crypto/text/encrypt', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async decryptText(payload: TextDecryptPayload): Promise<TextDecryptResult> {
    return this.request<TextDecryptResult>('/crypto/text/decrypt', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async encryptFile(file: File, category: string = 'file'): Promise<VaultFileItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return this.request<VaultFileItem>('/crypto/files/encrypt', {
      method: 'POST',
      body: formData,
    });
  }

  async decryptFileBlob(fileId: string): Promise<{ blob: Blob; filename: string }> {
    if (!API_BASE_URL) {
      throw new Error(
        'CryptX Backend API is not configured. Please set the VITE_API_BASE_URL environment variable in your Vercel project settings to your deployed FastAPI backend URL.'
      );
    }

    const url = `${API_BASE_URL}/crypto/files/${fileId}/decrypt`;
    const token = this.getToken();
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
      });
    } catch (networkError: any) {
      throw new Error(
        `Unable to connect to CryptX Backend API (${API_BASE_URL}) to decrypt file. Please verify that the backend server is running and accessible.`
      );
    }

    if (!response.ok) {
      let errorMsg = 'Failed to decrypt file';
      try {
        const errJson = await response.json();
        if (errJson.detail) errorMsg = errJson.detail;
      } catch {
        errorMsg = response.statusText;
      }
      throw new Error(errorMsg);
    }

    // Extract filename from Content-Disposition header
    let filename = 'decrypted_file';
    const disposition = response.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = await response.blob();
    return { blob, filename };
  }

  // --- Vault APIs ---
  async listVaultFiles(category?: string, search?: string, skip = 0, limit = 50): Promise<VaultFileItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    return this.request<VaultFileItem[]>(`/vault/files?${params.toString()}`);
  }

  async getVaultSummary(): Promise<VaultSummary> {
    return this.request<VaultSummary>('/vault/summary');
  }

  async deleteVaultFile(fileId: string): Promise<void> {
    return this.request<void>(`/vault/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // --- Activity APIs ---
  async listActivities(skip = 0, limit = 50): Promise<ActivityListResult> {
    return this.request<ActivityListResult>(`/activity?skip=${skip}&limit=${limit}`);
  }
}

export const api = new ApiService();

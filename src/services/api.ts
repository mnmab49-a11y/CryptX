/// <reference types="vite/client" />
// CryptX API Client Service

export const PRODUCTION_API_URL = 'https://cryptx-backend.fastapicloud.dev';
export const LOCAL_DEV_API_URL = 'http://127.0.0.1:8000';

/**
 * Validates whether a candidate string is a well-formed, absolute HTTP/HTTPS API URL.
 * Strictly rejects:
 *  - Non-string or empty inputs
 *  - JSON objects or JSON strings (e.g. root backend status {"name": "CryptX Backend", ...})
 *  - Relative URLs (e.g. "/api/v1")
 *  - Vercel frontend hostnames (preventing SPA loopback)
 */
export function isValidApiUrl(candidate: unknown): candidate is string {
  if (typeof candidate !== 'string') {
    return false;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return false;
  }

  // Reject JSON responses or serialized JSON objects (e.g. root API payload)
  if (
    trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    trimmed.includes('"name"') ||
    trimmed.includes('"status"') ||
    trimmed.includes('"api_v1"')
  ) {
    return false;
  }

  // Reject JavaScript expressions or code strings
  if (trimmed === 'undefined' || trimmed === 'null' || trimmed === '[object Object]') {
    return false;
  }

  // Must begin with an explicit http:// or https:// protocol (never a relative path)
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Reject Vercel frontend domains (API requests must target FastAPI, never the Vercel SPA)
    if (host.endsWith('.vercel.app') || host === 'vercel.app') {
      return false;
    }

    // Must be http or https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes an API base URL ensuring no trailing slashes and appending '/api/v1' if omitted.
 */
export function normalizeApiUrl(url: string): string {
  const clean = url.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
}

/**
 * Resolves the active CryptX API Base URL.
 * Priority order:
 * 1. Valid VITE_API_BASE_URL environment variable (from .env or build environment).
 * 2. In local development mode (`DEV`): http://127.0.0.1:8000/api/v1.
 * 3. In production mode (`PROD`): https://cryptx-backend.fastapicloud.dev/api/v1.
 */
export function resolveApiBaseUrl(): string {
  const rawEnv = (import.meta as any).env?.VITE_API_BASE_URL;

  if (isValidApiUrl(rawEnv)) {
    return normalizeApiUrl(rawEnv);
  }

  if (rawEnv && typeof rawEnv === 'string' && rawEnv.trim() !== '') {
    console.warn(
      `[CryptX] Rejected invalid VITE_API_BASE_URL: "${rawEnv.substring(0, 80)}". Reverting to sanctioned API backend URL.`
    );
  }

  // Local development fallback
  if ((import.meta as any).env?.DEV) {
    return normalizeApiUrl(LOCAL_DEV_API_URL);
  }

  // Production fallback: Always connect directly to the FastAPI cloud backend
  return normalizeApiUrl(PRODUCTION_API_URL);
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
  version?: string;
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

    const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${endpointPath}`;
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
      if (response.status === 401) {
        // Clear invalid/expired token and notify listeners
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cryptx:unauthorized'));
        }
      }
      let errorMsg = 'Request failed';
      if (typeof responseData === 'object' && responseData !== null) {
        if (typeof responseData.detail === 'string') {
          errorMsg = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          errorMsg = responseData.detail
            .map((d: any) => {
              if (typeof d === 'string') return d;
              if (d && typeof d === 'object') {
                const loc = Array.isArray(d.loc)
                  ? d.loc.filter((x: any) => x !== 'body').join('.')
                  : '';
                const msg = d.msg || d.message || JSON.stringify(d);
                return loc ? `${loc}: ${msg}` : msg;
              }
              return String(d);
            })
            .join('; ');
        } else if (responseData.message && typeof responseData.message === 'string') {
          errorMsg = responseData.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMsg = responseData.error;
        }
      } else if (typeof responseData === 'string' && responseData.trim()) {
        errorMsg = responseData;
      } else if (response.statusText) {
        errorMsg = `${response.status} ${response.statusText}`;
      } else {
        errorMsg = `HTTP Error ${response.status}: Request failed`;
      }
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
      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cryptx:unauthorized'));
        }
      }
      let errorMsg = 'Failed to decrypt file';
      try {
        const errJson = await response.json();
        if (typeof errJson.detail === 'string') {
          errorMsg = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorMsg = errJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
        } else if (errJson.message) {
          errorMsg = errJson.message;
        }
      } catch {
        errorMsg = response.statusText || `HTTP Error ${response.status}`;
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

  async getVaultFile(fileId: string): Promise<VaultFileItem> {
    return this.request<VaultFileItem>(`/vault/files/${fileId}`);
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

  // --- User Profile APIs ---
  async updateProfile(data: { full_name?: string; email?: string }): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/me/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();

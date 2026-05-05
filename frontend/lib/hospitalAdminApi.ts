import { API_BASE_URL, getAuthToken, type ApiResponse } from '@/lib/api';
import type { Appointment, Department, Doctor, HospitalProfile, AppointmentStatus } from '@/types/hospital';

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error =
      (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : null) || `Request failed (${response.status})`;
    return { error, status: response.status, errorDetails: payload };
  }
  return { data: payload as T, status: response.status };
}

function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown[] }).results)) {
    return (payload as { results: T[] }).results;
  }
  return [];
}

export const hospitalAdminApi = {
  async getProfile(): Promise<ApiResponse<HospitalProfile>> {
    const response = await fetch(`${API_BASE_URL}/hospital/admin/profile/profile/`, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store',
    });
    return parseJson<HospitalProfile>(response);
  },

  async updateProfile(payload: Partial<HospitalProfile>): Promise<ApiResponse<HospitalProfile>> {
    const response = await fetch(`${API_BASE_URL}/hospital/admin/profile/profile/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    return parseJson<HospitalProfile>(response);
  },

  async listDoctors(): Promise<ApiResponse<Doctor[]>> {
    const response = await fetch(`${API_BASE_URL}/hospital/admin/doctors/`, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store',
    });
    const parsed = await parseJson<unknown>(response);
    if (!parsed.data) return { error: parsed.error, status: parsed.status, errorDetails: parsed.errorDetails };
    return { data: normalizeList<Doctor>(parsed.data), status: parsed.status };
  },

  async listDepartments(): Promise<ApiResponse<Department[]>> {
    const response = await fetch(`${API_BASE_URL}/hospital/admin/departments/`, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store',
    });
    const parsed = await parseJson<unknown>(response);
    if (!parsed.data) return { error: parsed.error, status: parsed.status, errorDetails: parsed.errorDetails };
    return { data: normalizeList<Department>(parsed.data), status: parsed.status };
  },

  async listAppointments(status?: AppointmentStatus): Promise<ApiResponse<Appointment[]>> {
    const query = status ? `?status=${status}` : '';
    const response = await fetch(`${API_BASE_URL}/hospital/admin/appointments/${query}`, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store',
    });
    const parsed = await parseJson<unknown>(response);
    if (!parsed.data) return { error: parsed.error, status: parsed.status, errorDetails: parsed.errorDetails };
    return { data: normalizeList<Appointment>(parsed.data), status: parsed.status };
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${API_BASE_URL}/hospital/admin/appointments/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
      cache: 'no-store',
    });
    return parseJson<Appointment>(response);
  },
};

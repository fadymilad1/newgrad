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
  // ─── Profile ───────────────────────────────────────────────────────────────

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

  // ─── Doctors ───────────────────────────────────────────────────────────────

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

  async createDoctor(payload: {
    name: string;
    specialty: string;
    bio?: string;
    department: string;
    is_active?: boolean;
  }): Promise<ApiResponse<Doctor>> {
    const response = await fetch(`${API_BASE_URL}/hospital/admin/doctors/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ is_active: true, ...payload }),
      cache: 'no-store',
    });
    return parseJson<Doctor>(response);
  },

  async updateDoctor(
    id: string,
    payload: Partial<{
      name: string;
      specialty: string;
      bio: string;
      department: string;
      is_active: boolean;
    }>,
  ): Promise<ApiResponse<Doctor>> {
    const response = await fetch(`${API_BASE_URL}/hospital/admin/doctors/${id}/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    return parseJson<Doctor>(response);
  },

  // ─── Departments ───────────────────────────────────────────────────────────

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

  async createDepartment(payload: { name: string; description?: string }): Promise<ApiResponse<Department>> {
    const response = await fetch(`${API_BASE_URL}/hospital/admin/departments/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    return parseJson<Department>(response);
  },

  // ─── Appointments ──────────────────────────────────────────────────────────

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

  // ─── Schedules ─────────────────────────────────────────────────────────────

  /** Creates Mon–Fri 09:00–17:00 (30 min slots) for a newly created doctor */
  async createDefaultSchedules(doctorId: string): Promise<void> {
    const hdrs = authHeaders();
    const requests: Promise<Response>[] = [];
    for (let day = 0; day <= 4; day++) {
      requests.push(
        fetch(`${API_BASE_URL}/hospital/admin/schedules/`, {
          method: 'POST',
          headers: hdrs,
          body: JSON.stringify({
            doctor: doctorId,
            day_of_week: day,
            start_time: '09:00:00',
            end_time: '17:00:00',
            slot_duration_minutes: 30,
          }),
          cache: 'no-store',
        }),
      );
    }
    await Promise.allSettled(requests);
  },
};

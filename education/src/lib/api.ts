/**
 * IDROK AI Education — Django REST Framework API Client
 * Connects frontend directly to the Django backend endpoints with resilient fallbacks.
 */

const API_BASE_URL = typeof window !== 'undefined'
  ? '/api/v1/education'
  : 'http://127.0.0.1:8000/api/v1/education';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errorText);
    } catch {
      parsed = { detail: errorText };
    }
    throw new Error(parsed?.message || parsed?.detail || parsed?.error || `API Error: ${res.status}`);
  }

  return res.json();
}

export const educationApi = {
  // Check backend server connection
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth: Login
  async login(username: string, password?: string) {
    return fetchJson<{
      success: boolean;
      user: any;
      company: any;
      message: string;
    }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Dashboard Aggregates
  async getDashboard() {
    return fetchJson<{
      company_name: string;
      stats: {
        total_students: number;
        active_groups: number;
        teachers_count: number;
        monthly_revenue: number;
        overdue_debt: number;
        average_attendance: number;
      };
      recent_payments: any[];
      debtors: any[];
      groups: any[];
    }>('/dashboard/');
  },

  // Students
  async getStudents(params?: { search?: string; group_id?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.group_id && params.group_id !== 'all') query.append('group_id', params.group_id);
    if (params?.status && params.status !== 'all') query.append('status', params.status);

    const qs = query.toString();
    return fetchJson<any[]>(`/students/${qs ? `?${qs}` : ''}`);
  },

  async createStudent(data: {
    name: string;
    phone: string;
    group_id?: string;
    initial_payment?: number;
  }) {
    return fetchJson<any>('/students/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Groups
  async getGroups() {
    return fetchJson<any[]>('/groups/');
  },

  async createGroup(data: {
    name: string;
    room?: string;
    days?: string;
    time?: string;
    monthly_fee?: number;
  }) {
    return fetchJson<any>('/groups/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Teachers
  async getTeachers() {
    return fetchJson<any[]>('/teachers/');
  },

  // Tuition & Payments
  async getTuition() {
    return fetchJson<{
      total_collected: number;
      total_debt: number;
      payments: any[];
      debtors: any[];
    }>('/tuition/');
  },

  async recordPayment(data: {
    student_id: string;
    amount: number;
    payment_method: string;
    notes?: string;
  }) {
    return fetchJson<{
      success: boolean;
      message: string;
      payment: any;
      student_new_balance: number;
    }>('/tuition/record/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Timetable
  async getTimetable(day?: string) {
    const qs = day ? `?day=${encodeURIComponent(day)}` : '';
    return fetchJson<any[]>(`/timetable/${qs}`);
  },

  // Attendance
  async getAttendance(group_id?: string, date?: string) {
    const query = new URLSearchParams();
    if (group_id) query.append('group_id', group_id);
    if (date) query.append('date', date);
    const qs = query.toString();
    return fetchJson<any[]>(`/attendance/${qs ? `?${qs}` : ''}`);
  },

  async saveAttendance(data: {
    group_id: string;
    date: string;
    records: Array<{ student_id: string; status: string }>;
  }) {
    return fetchJson<{ success: boolean; message: string }>('/attendance/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Homework
  async getHomework() {
    return fetchJson<any[]>('/homework/');
  },

  // Exams
  async getExams() {
    return fetchJson<any[]>('/exams/');
  },

  // Gamification
  async getGamification() {
    return fetchJson<{
      leaderboard: Array<{
        rank: number;
        name: string;
        group: string;
        xp: number;
        coins: number;
        badge: string;
      }>;
      rewards: Array<{
        id: string;
        name: string;
        coins: number;
        image: string;
        stock: number;
      }>;
    }>('/gamification/');
  },
};

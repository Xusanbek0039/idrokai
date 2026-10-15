import {
  AuthUser,
  Company,
  DebtCustomer,
  DebtRecord,
  RepaymentRecord,
  DebtLedgerEntry,
  DebtSummary,
  DecimalAmount,
} from './types';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase() || 'GET')) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON response
    }
    const message = errorData?.message || errorData?.detail || `HTTP Error ${response.status}`;
    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}

export const api = {
  auth: {
    getCsrf: () => request<{ detail: string }>('/api/v1/auth/csrf'),
    login: (credentials: { email: string; password: string }) =>
      request<AuthUser>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () =>
      request<{ detail: string }>('/api/v1/auth/logout', {
        method: 'POST',
      }),
    me: () => request<AuthUser>('/api/v1/auth/me'),
  },

  companies: {
    list: () => request<Company[]>('/api/v1/companies'),
    create: (data: { name: string; phone?: string; address?: string }) =>
      request<Company>('/api/v1/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (companyId: string) => request<Company>(`/api/v1/companies/${companyId}`),
  },

  debts: {
    getCustomers: (companyId: string, search?: string, hasDebt?: boolean) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (hasDebt !== undefined) params.set('has_debt', String(hasDebt));
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request<{ count: number; results: DebtCustomer[] }>(
        `/api/v1/companies/${companyId}/debt-customers${qs}`
      );
    },
    createCustomer: (
      companyId: string,
      data: { full_name: string; phone_number: string; address?: string; credit_limit?: DecimalAmount; notes?: string }
    ) =>
      request<DebtCustomer>(`/api/v1/companies/${companyId}/debt-customers`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getCustomer: (companyId: string, customerId: string) =>
      request<DebtCustomer>(`/api/v1/companies/${companyId}/debt-customers/${customerId}`),
    getCustomerLedger: (companyId: string, customerId: string) =>
      request<DebtLedgerEntry[]>(`/api/v1/companies/${companyId}/debt-customers/${customerId}/ledger`),
    getDebts: (companyId: string, customerId?: string, status?: string) => {
      const params = new URLSearchParams();
      if (customerId) params.set('customer_id', customerId);
      if (status) params.set('status', status);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request<{ count: number; results: DebtRecord[] }>(`/api/v1/companies/${companyId}/debts${qs}`);
    },
    createDebt: (
      companyId: string,
      data: { customer_id: string; amount: DecimalAmount; description: string; due_date?: string },
      idempotencyKey?: string
    ) => {
      const key = idempotencyKey || generateUUID();
      return request<DebtRecord>(`/api/v1/companies/${companyId}/debts`, {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
        body: JSON.stringify(data),
      });
    },
    recordRepayment: (
      companyId: string,
      data: { customer_id: string; debt_id?: string | null; amount: DecimalAmount; payment_method: 'cash' | 'card' | 'bank_transfer'; notes?: string },
      idempotencyKey?: string
    ) => {
      const key = idempotencyKey || generateUUID();
      return request<RepaymentRecord>(`/api/v1/companies/${companyId}/repayments`, {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
        body: JSON.stringify(data),
      });
    },
    getSummary: (companyId: string) =>
      request<DebtSummary>(`/api/v1/companies/${companyId}/reports/debt-summary`),
  },
};

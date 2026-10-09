import {
  ApiResponse,
  CreateReportPayload,
  DashboardStats,
  LoginResponseData,
  PageResponse,
  Report,
  ReportCategory,
  ReportStatus,
  ReportSummary,
  StatusUpdatePayload
} from '../types';

// Local Vite development uses /api through its proxy. Production uses the
// deployed backend URL supplied by Vercel as VITE_API_BASE_URL.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem('whistledrop_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch (err) {
    throw new ApiError('Failed to parse server response.', response.status);
  }

  if (!response.ok || !data.success) {
    if (response.status === 401 && endpoint.startsWith('/moderator')) {
      localStorage.removeItem('whistledrop_token');
      localStorage.removeItem('whistledrop_user');
      window.dispatchEvent(new Event('whistledrop_auth_expired'));
    }
    throw new ApiError(data.message || 'An error occurred while processing the request.', response.status, data.data);
  }

  return data;
}

// Public API
export async function submitReport(payload: CreateReportPayload): Promise<Report> {
  const res = await request<Report>('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data!;
}

export async function trackReport(caseCode: string): Promise<Report> {
  const sanitized = encodeURIComponent(caseCode.trim().toUpperCase());
  const res = await request<Report>(`/reports/${sanitized}`, {
    method: 'GET',
  });
  return res.data!;
}

// Moderator Auth API
export async function loginModerator(username: string, password: string): Promise<LoginResponseData> {
  const res = await request<LoginResponseData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return res.data!;
}

// Moderator Management API
export async function fetchModeratorReports(params: {
  category?: ReportCategory;
  status?: ReportStatus;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<PageResponse<ReportSummary>> {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.size !== undefined) query.append('size', params.size.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortDir) query.append('sortDir', params.sortDir);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await request<PageResponse<ReportSummary>>(`/moderator/reports${queryString}`, {
    method: 'GET',
  });
  return res.data!;
}

export async function fetchModeratorReportDetail(caseCode: string): Promise<Report> {
  const sanitized = encodeURIComponent(caseCode.trim().toUpperCase());
  const res = await request<Report>(`/moderator/reports/${sanitized}`, {
    method: 'GET',
  });
  return res.data!;
}

export async function updateReportStatus(caseCode: string, payload: StatusUpdatePayload): Promise<Report> {
  const sanitized = encodeURIComponent(caseCode.trim().toUpperCase());
  const res = await request<Report>(`/moderator/reports/${sanitized}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data!;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await request<DashboardStats>('/moderator/dashboard/stats', {
    method: 'GET',
  });
  return res.data!;
}

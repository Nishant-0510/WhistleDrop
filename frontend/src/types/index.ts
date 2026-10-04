export type ReportCategory = 'SECURITY' | 'HARASSMENT' | 'CORRUPTION' | 'TECHNICAL' | 'OTHER';

export type ReportStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface StatusUpdate {
  id: number;
  status: ReportStatus;
  message: string;
  createdAt: string;
}

export interface Report {
  caseCode: string;
  category: ReportCategory;
  description: string;
  evidenceUrl?: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusUpdate[];
}

export interface ReportSummary {
  caseCode: string;
  category: ReportCategory;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  descriptionSnippet: string;
}

export interface CreateReportPayload {
  category: ReportCategory;
  description: string;
  evidenceUrl?: string | null;
}

export interface StatusUpdatePayload {
  status: ReportStatus;
  message: string;
}

export interface DashboardStats {
  totalReports: number;
  submittedCount: number;
  underReviewCount: number;
  resolvedCount: number;
  dismissedCount: number;
  categoryBreakdown: Record<ReportCategory, number>;
  recentReports: ReportSummary[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}

export interface LoginResponseData {
  token: string;
  tokenType: string;
  username: string;
  role: string;
  expiresIn: number;
}

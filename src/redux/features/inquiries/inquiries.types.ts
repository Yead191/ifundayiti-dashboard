export type InquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "MEETING_SCHEDULED"
  | "PROPOSAL_SENT"
  | "COMPLETED"
  | "CLOSED";

export type ProjectBudget =
  | "UNDER_100"
  | "100_300"
  | "300_500"
  | "600_1000"
  | "ABOVE_1000";

export interface ApiInquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectDescription: string;
  budget: ProjectBudget;
  status: InquiryStatus;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetInquiriesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: InquiryStatus | "";
  budget?: ProjectBudget | "";
}

export interface InquiriesListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiInquiry[];
}

export interface UpdateInquiryPayload {
  phone?: string;
  company?: string;
  projectDescription?: string;
  budget?: ProjectBudget;
  status?: InquiryStatus;
  note?: string;
}

export interface CreateInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectDescription: string;
  budget: ProjectBudget;
  status?: InquiryStatus;
  note?: string;
}

export interface InquiryMutationResponse {
  success: boolean;
  message: string;
  data?: ApiInquiry;
}

export const INQUIRY_STATUS_OPTIONS: InquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "MEETING_SCHEDULED",
  "PROPOSAL_SENT",
  "COMPLETED",
  "CLOSED",
];

export const PROJECT_BUDGET_OPTIONS: ProjectBudget[] = [
  "UNDER_100",
  "100_300",
  "300_500",
  "600_1000",
  "ABOVE_1000",
];

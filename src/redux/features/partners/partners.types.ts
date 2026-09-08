export const PARTNER_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type PartnerStatus = (typeof PARTNER_STATUS)[keyof typeof PARTNER_STATUS];

export const PARTNER_STATUS_OPTIONS = Object.values(PARTNER_STATUS);

export interface PartnerUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
}

export interface ApiPartner {
  _id: string;
  user?: PartnerUser | string | null;
  name: string;
  image: string;
  description?: string;
  offers: string[];
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: PartnerStatus | string;
  featured: boolean;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetPartnersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: PartnerStatus | string;
  featured?: boolean;
  sort?: string;
}

export interface PartnersListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiPartner[];
}

export interface PartnerDetailResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: ApiPartner;
}

export interface PartnerMutationResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: ApiPartner;
}

export interface ChangePartnerStatusPayload {
  id: string;
  status: PartnerStatus | "APPROVED" | "REJECTED" | "PENDING";
  rejectionReason?: string;
}

/** Values collected by the form before building multipart FormData. */
export interface PartnerFormPayload {
  name: string;
  description?: string;
  offers?: string[];
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: PartnerStatus;
  featured?: boolean;
  image?: File | null;
  userId?: string | null;
}

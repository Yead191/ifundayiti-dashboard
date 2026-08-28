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
}

export interface ApiPartner {
  _id: string;
  user?: PartnerUser | null;
  name: string;
  image: string;
  description: string;
  offers: string[];
  website: string;
  contactEmail: string;
  contactPhone: string;
  status: PartnerStatus | string;
  featured: boolean;
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
  status?: PartnerStatus;
  featured?: boolean;
}

export interface PartnersListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiPartner[];
}

export interface PartnerDetailResponse {
  success: boolean;
  message: string;
  data: ApiPartner;
}

export interface PartnerMutationResponse {
  success: boolean;
  message: string;
  data?: ApiPartner;
}

export interface ChangePartnerStatusPayload {
  id: string;
  status: PartnerStatus;
}

/** Values collected by the form before building multipart FormData. */
export interface PartnerFormPayload {
  name: string;
  description: string;
  offers: string[];
  website: string;
  contactEmail: string;
  contactPhone: string;
  status: PartnerStatus;
  featured: boolean;
  image: File | null;
  userId?: string | null;
}

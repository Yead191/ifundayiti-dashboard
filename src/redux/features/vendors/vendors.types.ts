import type { UserSubscription } from "../users/users.types";

export type VendorAccountStatus = "active" | "pending" | "blocked" | "rejected";

export interface VendorProfile {
  jobTitle: string;
  contactNo: string;
  bio: string;
  expertise: string[];
  yearsExperience: string;
  degree: string;
  linkedin: string;
  hourlyRate: number;
  availability: string;
  consultationTypes: string[];
  applicationStatus?: string;
  isProfileVisible?: boolean;
}

export interface ApiVendor {
  _id: string;
  name: string;
  role: string;
  email: string;
  image: string;
  status: VendorAccountStatus;
  rejectionReason: string | null;
  verified: boolean;
  interest: string;
  company: string;
  subscription?: UserSubscription | null;
  vendorProfile: VendorProfile;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetVendorsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: VendorAccountStatus | "";
  availability?: string;
  hourlyRateRange?: string;
}

export interface VendorsListResponse {
  success: boolean;
  message: string;
  pagination: PaginationMeta;
  data: ApiVendor[];
}

export interface ChangeVendorStatusPayload {
  status: VendorAccountStatus;
  rejectionReason?: string;
}

export interface ChangeProfileVisibilityPayload {
  isProfileVisible: boolean;
}

export interface VendorMutationResponse {
  success: boolean;
  message: string;
  data?: ApiVendor;
}

export interface CreateVendorProfileInput {
  jobTitle: string;
  contactNo: string;
  bio: string;
  expertise: string[];
  yearsExperience: string;
  degree: string;
  linkedin: string;
  hourlyRate: number;
  availability: string;
  consultationTypes: string[];
  applicationStatus?: string;
  isProfileVisible: boolean;
}

export interface CreateVendorPayload {
  name: string;
  email: string;
  password: string;
  company: string;
  interest: string;
  status: VendorAccountStatus;
  verified: boolean;
  vendorProfile: CreateVendorProfileInput;
  imageFile?: File | null;
}

export const VENDOR_STATUS_OPTIONS: VendorAccountStatus[] = [
  "pending",
  "active",
  "blocked",
  "rejected",
];

export const VENDOR_AVAILABILITY_OPTIONS = [
  "Full Time",
  "Part Time",
  "Project Based",
  "Weekends Only",
  "Limited",
] as const;

export const VENDOR_CONSULTATION_TYPES = ["Online", "Onsite"] as const;

export const VENDOR_HOURLY_RATE_RANGES = [
  { label: "$0 – $50", value: "0-50" },
  { label: "$50 – $120", value: "50-120" },
  { label: "$120 – $200", value: "120-200" },
  { label: "$200+", value: "200-1000" },
] as const;

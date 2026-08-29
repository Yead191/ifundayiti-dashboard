export type TeamStatus = "pending" | "active" | "rejected" | "blocked";
export type TeamMemberCategory = "director" | "member" | "volunteer";

export interface TeamMember {
  _id: string;
  name: string;
  category: TeamMemberCategory;
  location: string;
  bio: string;
  image: string;
  status: TeamStatus;
  focusAreas: string[];
  email: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  featured?: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface TeamStats {
  totalDirectors: number;
  totalMembers: number;
  totalVolunteers: number;
  totalVolunteersPending: number;
}

export interface TeamStatsResponse {
  success: boolean;
  message: string;
  data: TeamStats;
}

export interface TeamListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  status?: string;
}

export interface TeamListPagination {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface TeamListResponse {
  success: boolean;
  message: string;
  pagination: TeamListPagination;
  data: TeamMember[];
}

export interface TeamSingleResponse {
  success: boolean;
  message: string;
  data: TeamMember;
}

export interface ChangeTeamStatusPayload {
  status: TeamStatus;
  rejectionReason?: string;
}

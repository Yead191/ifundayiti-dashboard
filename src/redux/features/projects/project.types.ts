export const PROJECT_CATEGORIES = [
  "Food & Agriculture",
  "Clean Energy",
  "Water & Sanitation",
  "Education",
  "Healthcare",
  "Livelihood",
  "Small Business",
  "Community Development",
  "Environment",
  "Arts & Crafts",
  "Other",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PROJECT_STATUSES = ["Draft", "Published", "Archived"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface ProjectApplicationPeriod {
  _id: string;
  title: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  location: string;
  grantAmount?: number;
  status: ProjectStatus;
  category: ProjectCategory;
  founder?: string;
  year?: number;
  image?: string;
  gallery?: string[];
  applicationPeriod?: ProjectApplicationPeriod | string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  story?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ProjectListResponse {
  success: boolean;
  message: string;
  data: Project[];
  pagination?: ProjectPagination;
}

export interface ProjectSingleResponse {
  success: boolean;
  message: string;
  data: Project;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  sort?: string;
}

export interface ProjectStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  archivedProjects: number;
  featuredProjects: number;
  totalGrantAmount: number;
}

export interface ChangeProjectStatusPayload {
  status: ProjectStatus;
}

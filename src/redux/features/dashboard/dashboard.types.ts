export interface DashboardOverview {
  totalServices: number;
  totalUsers: number;
  approvedVendors: number;
  pendingVendors: number;
  totalProducts: number;
  reportedPost: number;
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: DashboardOverview;
}

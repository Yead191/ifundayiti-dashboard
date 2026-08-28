export interface DashboardOverview {
  totalApplication: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  finalist: number;
  winner: number;
  archived: number;
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: DashboardOverview;
}

export interface FundStats {
  balance: number;
  totalDonations: number;
  totalGrants: number;
}

export interface FundStatsResponse {
  success: boolean;
  message: string;
  data: FundStats;
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface MonthlyCountResponse {
  success: boolean;
  message: string;
  data: MonthlyCount[];
}

export interface MonthlyAmount {
  month: string;
  amount: number;
}

export interface MonthlyAmountResponse {
  success: boolean;
  message: string;
  data: MonthlyAmount[];
}

export interface StatusStats {
  status: string;
  count: number;
}

export interface StatusStatsResponse {
  success: boolean;
  message: string;
  data: StatusStats[];
}

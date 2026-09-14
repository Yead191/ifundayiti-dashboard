export interface IDonationApplicant {
  _id: string;
  projectTitle?: string;
  awardedAmount?: number;
  status?: string;
  quote?: string;
  successStory?: string;
  personal?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  applicationPeriod?: {
    _id: string;
    title?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface IDonation {
  _id: string;
  name: string;
  email: string;
  amount: number;
  transactionId?: string;
  type: "donation" | "grant";
  applicant?: IDonationApplicant;
  createdAt: string;
  updatedAt: string;
}

export interface IFundStats {
  balance: number;
  programFundBalance: number;
  totalDonations: number;
  totalGrants: number;
  donationCount: number;
  grantCount: number;
  totalCount: number;
}

export interface DonationListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: "donation" | "grant";
  sort?: string;
}

export interface DonationListResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: IDonation[];
}

export interface SingleDonationResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: IDonation;
}

export interface FundStatsResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: IFundStats;
}

export interface DeleteMultipleDonationsResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: {
    deletedCount: number;
  };
}

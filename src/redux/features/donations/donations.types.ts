export type DONATION_PAYMENT_METHOD =
  | "cash"
  | "bank_transfer"
  | "direct"
  | "stripe"
  | "other";

export type DONATION_PAYMENT_STATUS = "pending" | "paid" | "failed" | "refunded";

export type DONATION_TYPE = "donation" | "grant" | "fund_raising";

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
  type: DONATION_TYPE;
  payment_status?: DONATION_PAYMENT_STATUS;
  payment_method?: DONATION_PAYMENT_METHOD;
  reference?: string;
  notes?: string;
  recordedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  applicant?: IDonationApplicant;
  createdAt: string;
  updatedAt: string;
}

export interface IFundStats {
  totalBalance: number;
  balance?: number; // for backward compatibility
  programFundBalance?: number;
  totalDonations: number;
  totalGrants: number;
  totalFundRaised: number; // Combines offline fundraising + paid store order revenues
  donationCount: number;
  grantCount: number;
  fundRaisedCount: number; // Combines offline fundraising entries + completed paid store orders
  totalCount: number;
}

export interface DonationListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: DONATION_TYPE;
  sort?: string;
}

export interface CreateManualDonationPayload {
  name: string;
  email?: string;
  amount: number;
  type: "donation" | "fund_raising";
  payment_method: DONATION_PAYMENT_METHOD;
  reference?: string;
  notes?: string;
}

export interface CreateManualDonationResponse {
  statusCode: number;
  success: boolean;
  message?: string;
  data: IDonation;
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

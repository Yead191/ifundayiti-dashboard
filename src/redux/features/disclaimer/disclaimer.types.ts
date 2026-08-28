export type DisclaimerType = "refund" | "vendor-terms" | "user-terms" | "privacy";

export interface GetDisclaimerParams {
  type: DisclaimerType;
}

export interface DisclaimerResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface UpsertDisclaimerPayload {
  type: DisclaimerType;
  content: string;
}

export interface DisclaimerMutationResponse {
  success: boolean;
  message: string;
  data?: string;
}

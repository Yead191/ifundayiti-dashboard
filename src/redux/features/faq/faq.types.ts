export type FaqAudience = "USER" | "VENDOR";

export interface ApiFaq {
  _id: string;
  question: string;
  answer: string;
  audience: FaqAudience;
}

export interface GetFaqsParams {
  audience: FaqAudience;
}

export interface FaqListResponse {
  success: boolean;
  message: string;
  data: ApiFaq[];
}

export interface FaqPayload {
  question: string;
  answer: string;
  audience: FaqAudience;
}

export interface FaqMutationResponse {
  success: boolean;
  message: string;
  data?: ApiFaq;
}

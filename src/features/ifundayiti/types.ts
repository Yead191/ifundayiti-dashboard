/**
 * IFundAyiti — micro grant application lifecycle domain model.
 * Mirrors the backend schema while normalizing ids to `id` and keeping
 * every uploaded file in a single `documents` array.
 */

export type ApplicationStatus =
  | "submitted"
  | "underReview"
  | "approved"
  | "rejected"
  | "finalist"
  | "winner"
  | "archived";

export type PeriodStatus = "Upcoming" | "Open" | "Review" | "WinnerSelection" | "Closed";

export type DocumentType =
  | "government_id"
  | "proof_of_address"
  | "business_plan"
  | "supporting_image"
  | "supporting_document";

export interface ApplicationDocument {
  id: string;
  type: DocumentType;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface ApplicationPersonal {
  name: string;
  dob: string;
  nationality: string;
  location: string;
  image: string;
  occupation: string;
  financialBackground: string;
}

export interface ApplicationContact {
  email: string;
  phone: string;
}

export interface ApplicationIdentification {
  nationalId: string;
  passport: string;
}

export interface ApplicationGrant {
  projectName: string;
  projectDescription: string;
  requestedAmount: number;
  fundUsage: string;
  expectedImpact: string;
}

/** Winner award details captured in the "Select Winner" flow. */
export interface WinnerAward {
  awardAmount: number;
  transferDate: string;
  adminNotes: string;
}

export interface Application {
  id: string;
  trackingId: string;
  periodId: string;
  personal: ApplicationPersonal;
  contact: ApplicationContact;
  identification: ApplicationIdentification;
  grant: ApplicationGrant;
  documents: ApplicationDocument[];
  status: ApplicationStatus;
  fundedAmount: number | null;
  award: WinnerAward | null;
  successStory: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
}

export interface ApplicationPeriod {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maximumGrantAmount: number;
  status: PeriodStatus;
}

export type ApplicationPeriodInput = Omit<ApplicationPeriod, "id">;

export interface Donation {
  id: string;
  donor: string;
  email: string;
  amount: number;
  transactionId: string;
  date: string;
}

/** Hard business limits enforced across the application lifecycle. */
export const MAX_FINALISTS = 5;
export const MAX_GRANT_AMOUNT = 1000;

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  government_id: "Government ID",
  proof_of_address: "Proof of Address",
  business_plan: "Business Plan",
  supporting_image: "Supporting Image",
  supporting_document: "Supporting Document",
};

export const PERIOD_STATUS_OPTIONS: PeriodStatus[] = [
  "Upcoming",
  "Open",
  "Review",
  "WinnerSelection",
  "Closed",
];

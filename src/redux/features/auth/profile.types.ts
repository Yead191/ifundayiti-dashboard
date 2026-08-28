export interface ApiProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

export interface ProfileResponse {
  success?: boolean;
  message?: string;
  data: ApiProfile;
}

export interface ProfileFormPayload {
  name: string;
  imageFile?: File | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

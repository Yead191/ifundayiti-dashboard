import type { ProfileFormPayload } from "./profile.types";

/** Build the multipart FormData body expected by PATCH `/user/profile`. */
export function buildProfileFormData(payload: ProfileFormPayload): FormData {
  const formData = new FormData();
  formData.append("name", payload.name.trim());

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  return formData;
}

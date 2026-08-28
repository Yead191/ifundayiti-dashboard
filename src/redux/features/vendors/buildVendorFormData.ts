import type { CreateVendorPayload } from "./vendors.types";

/** Build the multipart FormData body expected by POST `/vendor/create`. */
export function buildVendorFormData(payload: CreateVendorPayload): FormData {
  const formData = new FormData();

  formData.append("name", payload.name.trim());
  formData.append("email", payload.email.trim().toLowerCase());
  formData.append("password", payload.password);
  formData.append("company", payload.company.trim());
  formData.append("interest", payload.interest.trim());
  formData.append("status", payload.status);
  formData.append("verified", String(payload.verified));
  formData.append(
    "vendorProfile",
    JSON.stringify({
      ...payload.vendorProfile,
    }),
  );

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  return formData;
}

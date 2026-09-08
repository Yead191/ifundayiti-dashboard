import type { PartnerFormPayload } from "./partners.types";

export type PartnerJsonBody = {
  name: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: PartnerFormPayload["status"];
  featured?: boolean;
  offers: string[];
  user?: string;
};

/** Always return a clean string array — handles array or comma separated string. */
export function normalizeOffers(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === "string" ? item.split(",") : String(item)))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/** JSON payload — keeps booleans as real booleans for API validation. */
export function buildPartnerJsonBody(payload: PartnerFormPayload): PartnerJsonBody {
  return {
    name: payload.name.trim(),
    description: (payload.description ?? "").trim(),
    website: (payload.website ?? "").trim(),
    contactEmail: (payload.contactEmail ?? "").trim(),
    contactPhone: (payload.contactPhone ?? "").trim(),
    status: payload.status,
    featured: payload.featured ?? false,
    offers: normalizeOffers(payload.offers),
    ...(payload.userId ? { user: payload.userId } : {}),
  };
}

/** Multipart body with only the logo file (used after JSON create/update). */
export function buildPartnerImageFormData(image: File): FormData {
  const formData = new FormData();
  formData.append("image", image);
  return formData;
}

/** Full multipart body for create — all fields plus logo in one request. */
export function buildPartnerFormData(payload: PartnerFormPayload): FormData {
  const data = buildPartnerJsonBody(payload);
  const formData = new FormData();

  formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.website) formData.append("website", data.website);
  if (data.contactEmail) formData.append("contactEmail", data.contactEmail);
  if (data.contactPhone) formData.append("contactPhone", data.contactPhone);
  if (data.status) formData.append("status", data.status);
  formData.append("featured", data.featured ? "true" : "false");

  // Send offers as JSON string according to specification
  formData.append("offers", JSON.stringify(data.offers));

  if (data.user) {
    formData.append("user", data.user);
  }

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return formData;
}

/** Multipart body for updating partner details. */
export function buildPartnerUpdateFormData(
  payload: Partial<PartnerFormPayload>
): FormData {
  const formData = new FormData();

  if (payload.name !== undefined) {
    formData.append("name", payload.name.trim());
  }
  if (payload.description !== undefined) {
    formData.append("description", payload.description.trim());
  }
  if (payload.website !== undefined) {
    formData.append("website", payload.website.trim());
  }
  if (payload.contactEmail !== undefined) {
    formData.append("contactEmail", payload.contactEmail.trim());
  }
  if (payload.contactPhone !== undefined) {
    formData.append("contactPhone", payload.contactPhone.trim());
  }
  if (payload.status !== undefined) {
    formData.append("status", payload.status);
  }
  if (payload.featured !== undefined) {
    formData.append("featured", payload.featured ? "true" : "false");
  }
  if (payload.offers !== undefined) {
    const cleanOffers = normalizeOffers(payload.offers);
    formData.append("offers", JSON.stringify(cleanOffers));
  }
  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return formData;
}

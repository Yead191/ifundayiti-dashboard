import type { PartnerFormPayload } from "./partners.types";

export type PartnerJsonBody = {
  name: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  status: PartnerFormPayload["status"];
  featured: boolean;
  offers: string[];
  user?: string;
};

/** Always return a string array — handles a single string or one tag from the form. */
export function normalizeOffers(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeOffers(item));
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
    description: payload.description.trim(),
    website: payload.website.trim(),
    contactEmail: payload.contactEmail.trim(),
    contactPhone: payload.contactPhone.trim(),
    status: payload.status,
    featured: payload.featured,
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
  formData.append("description", data.description);
  formData.append("website", data.website);
  formData.append("contactEmail", data.contactEmail);
  formData.append("contactPhone", data.contactPhone);
  formData.append("status", data.status);
  formData.append("featured", data.featured ? "true" : "false");

  for (const offer of data.offers) {
    formData.append("offers[]", offer);
  }

  if (data.user) {
    formData.append("user", data.user);
  }

  if (payload.image) {
    formData.append("image", payload.image);
  }

  return formData;
}

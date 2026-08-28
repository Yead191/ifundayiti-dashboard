import type { EventFormPayload } from "./events.types";

/** Build the multipart FormData body expected by POST/PATCH `/event`. */
export function buildEventFormData(payload: EventFormPayload): FormData {
  const formData = new FormData();

  formData.append("title", payload.title.trim());
  formData.append("description", payload.description.trim());
  formData.append("eventDate", payload.eventDate);
  formData.append("endDate", payload.endDate);
  formData.append("location", payload.location.trim());
  formData.append("type", payload.type);
  formData.append("status", payload.status);
  formData.append("isFeatured", String(payload.isFeatured));

  formData.append("organization[name]", payload.organization.name.trim());
  formData.append("organization[designation]", payload.organization.designation.trim());
  formData.append("organization[email]", payload.organization.email.trim());

  for (const tag of payload.tags.map((t) => t.trim()).filter(Boolean)) {
    formData.append("tags", tag);
  }

  if (payload.coverImageFile) {
    formData.append("coverImage", payload.coverImageFile);
  }

  for (const file of payload.imageFiles ?? []) {
    formData.append("images", file);
  }

  return formData;
}

import type { BookFormPayload } from "./store.types";

/** Build the multipart FormData body expected by POST/PATCH `/books`. */
export function buildBookFormData(payload: BookFormPayload): FormData {
  const formData = new FormData();

  formData.append("type", payload.type);
  formData.append("title", payload.title.trim());
  formData.append("subtitle", payload.subtitle.trim());
  formData.append("description", payload.description.trim());
  formData.append("price", String(payload.price));
  formData.append("details", JSON.stringify(payload.details));

  if (payload.type === "digital" && payload.accent) {
    formData.append("accent", JSON.stringify(payload.accent));
  }

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  if (payload.type === "digital" && payload.fileUpload) {
    formData.append("file", payload.fileUpload);
  }

  return formData;
}

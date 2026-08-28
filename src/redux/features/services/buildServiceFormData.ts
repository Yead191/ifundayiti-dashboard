import type { ServiceFormPayload } from "./services.types";

/** Build the multipart FormData body expected by POST/PATCH `/services`. */
export function buildServiceFormData(payload: ServiceFormPayload): FormData {
  const formData = new FormData();

  formData.append("title", payload.title.trim());
  formData.append("tagline", payload.tagline.trim());
  formData.append(
    "price",
    JSON.stringify({
      amount: payload.amount,
      frequency: payload.frequency.trim(),
    })
  );
  formData.append("featured", String(payload.featured));
  formData.append("longDescription", payload.longDescription.trim());

  const features = payload.features.map((f) => f.trim()).filter(Boolean);
  for (const feature of features) {
    formData.append("features[]", feature);
  }

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  return formData;
}

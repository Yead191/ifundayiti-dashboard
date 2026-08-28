import type { TestimonialFormPayload } from "./testimonials.types";

/** Build the multipart FormData body expected by POST/PATCH `/testimonial`. */
export function buildTestimonialFormData(payload: TestimonialFormPayload): FormData {
  const formData = new FormData();

  formData.append("quote", payload.quote.trim());
  formData.append("name", payload.name.trim());
  formData.append("role", payload.role.trim());
  formData.append("company", payload.company.trim());

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  return formData;
}

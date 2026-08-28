import type { PartnerFormPayload } from "@/redux/features/partners/partners.types";
import type { PartnerMutationResponse } from "@/redux/features/partners/partners.types";
import {
  buildPartnerFormData,
  buildPartnerImageFormData,
  buildPartnerJsonBody,
  type PartnerJsonBody,
} from "@/redux/features/partners/buildPartnerFormData";

type CreatePartner = (body: PartnerJsonBody | FormData) => {
  unwrap: () => Promise<PartnerMutationResponse>;
};
type UpdatePartner = (arg: {
  id: string;
  body: PartnerJsonBody | FormData;
}) => { unwrap: () => Promise<PartnerMutationResponse> };

/** Save partner — FormData (with logo) on create; JSON + optional logo patch on update. */
export async function savePartner(
  payload: PartnerFormPayload,
  mutations: {
    partnerId?: string;
    createPartner: CreatePartner;
    updatePartner: UpdatePartner;
  }
): Promise<PartnerMutationResponse> {
  if (mutations.partnerId) {
    const jsonBody = buildPartnerJsonBody(payload);
    const response = await mutations.updatePartner({
      id: mutations.partnerId,
      body: jsonBody,
    }).unwrap();

    if (payload.image) {
      await mutations.updatePartner({
        id: mutations.partnerId,
        body: buildPartnerImageFormData(payload.image),
      }).unwrap();
    }

    return response;
  }

  // Create with logo: single FormData POST (matches API spec).
  if (payload.image) {
    return mutations.createPartner(buildPartnerFormData(payload)).unwrap();
  }

  return mutations.createPartner(buildPartnerJsonBody(payload)).unwrap();
}

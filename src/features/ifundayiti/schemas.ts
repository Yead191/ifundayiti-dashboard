import { z } from "zod";
import { MAX_GRANT_AMOUNT, PERIOD_STATUS_OPTIONS } from "./types";

/** Winner award form — award amount is capped by the period's maximum grant. */
export const winnerAwardSchema = (maxAmount: number = MAX_GRANT_AMOUNT) =>
  z.object({
    awardAmount: z
      .number({ error: "Award amount is required" })
      .positive("Award amount must be greater than 0")
      .max(maxAmount, `Award amount cannot exceed $${maxAmount}`),
    transferDate: z.string().min(1, "Transfer date is required"),
    adminNotes: z.string().max(500, "Keep notes under 500 characters").optional().or(z.literal("")),
  });

export type WinnerAwardValues = z.infer<ReturnType<typeof winnerAwardSchema>>;

export const rejectionReasonSchema = z.object({
  reason: z.string().trim().min(10, "Please provide at least 10 characters explaining the decision"),
});

export const winnerStorySchema = z.object({
  successStory: z.string().trim().min(10, "The winner story should be at least 10 characters"),
});

export const applicationPeriodSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().max(400, "Keep the description under 400 characters").optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    maximumGrantAmount: z
      .number({ error: "Maximum grant amount is required" })
      .min(1, "Minimum grant amount is $1")
      .max(MAX_GRANT_AMOUNT, `Maximum grant amount is $${MAX_GRANT_AMOUNT}`),
    status: z.enum(PERIOD_STATUS_OPTIONS as [string, ...string[]]),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after the start date",
    path: ["endDate"],
  });

export type ApplicationPeriodValues = z.infer<typeof applicationPeriodSchema>;

/** Map a ZodError into an Ant Design Form-friendly field error list. */
export function zodToFormErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    name: issue.path as (string | number)[],
    errors: [issue.message],
  }));
}

import { z } from "zod";

const nullableStr = (max: number) =>
  z.string().trim().max(max).nullish().transform((v) => v ?? null);

export const captureSchema = z.object({
  event: z.enum(["zip_submit"]),
  sessionId: z.string().min(1).max(80),
  zip: z
    .string()
    .regex(/^\d{5}$/)
    .nullish()
    .transform((v) => v ?? null),
  served: z.boolean(),
  pageVariant: nullableStr(60),
  formLoadedAt: z.number().int().nonnegative(),
  referrer: nullableStr(500),
  utm_source: nullableStr(120),
  utm_medium: nullableStr(120),
  utm_campaign: nullableStr(120),
  utm_content: nullableStr(120),
  utm_term: nullableStr(120),
});

export type CaptureInput = z.infer<typeof captureSchema>;

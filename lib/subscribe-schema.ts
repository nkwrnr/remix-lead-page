import { z } from "zod";
import { MAX_EMAIL_LENGTH } from "./constants";

const nullableStr = (max: number) =>
  z.string().trim().max(max).nullish().transform((v) => v ?? null);

export const subscribeSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.email().max(MAX_EMAIL_LENGTH),
  ),
  path: z.enum(["served", "unserved", "skipped"]),
  zip: z
    .string()
    .regex(/^\d{5}$/)
    .nullish()
    .transform((v) => v ?? null),
  matchedStore: nullableStr(200),
  productInterest: z
    .enum(["perfect-paloma", "muddled-berry-mojito", "both", "unset"])
    .default("unset"),
  consent: z.boolean(),
  website: z.string().max(0).optional().default(""), // honeypot: must be empty
  formLoadedAt: z.number().int().nonnegative(),
  utm_source: nullableStr(120),
  utm_medium: nullableStr(120),
  utm_campaign: nullableStr(120),
  utm_content: nullableStr(120),
  utm_term: nullableStr(120),
  referrer: nullableStr(500),
  pageVariant: nullableStr(60),
  sessionId: nullableStr(80),
  capturedZip: z
    .string()
    .regex(/^\d{5}$/)
    .nullish()
    .transform((v) => v ?? null),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

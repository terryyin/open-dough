// Local read projection for Recently done cards.
import { z } from "zod";
export const ciFollowUpEndpoint = "/__project-configuration/ci-follow-up";
const cardSchema = z.object({
  revision: z.string(),
  identity: z.string().optional(),
  reviewable: z.boolean().optional(),
  originalMs: z.number().nonnegative(),
  averageMs: z.number().positive(),
  repeatMs: z.number().nonnegative().optional(),
  kind: z.enum(["unverified", "progress", "slow", "recovered"]),
  explanation: z.string(),
});
export const ciFollowUpAnswerSchema = z.object({
  cards: z.array(cardSchema),
});
export type CiFollowUpAnswer = z.infer<typeof ciFollowUpAnswerSchema>;
export { provisionalRepeatRule } from "./ciFollowUpRule.ts";

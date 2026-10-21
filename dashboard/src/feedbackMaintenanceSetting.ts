// The standing authorization for feedback maintenance on this machine: off by
// default, and when on, the host and optional model (with Codex's optional
// reasoning effort) the maintain-feedback-cycle session runs on, chosen from
// the launch dialog's own choices (`./LaunchHostModel.tsx`). The server keeps
// it in `~/.open-dough/dashboard/feedback-maintenance.json`; only these local
// endpoints write it, never a session.
import { z } from "zod";
import { launchHosts } from "./hostDescription.ts";
import { launchSettingSchema } from "./launchHostOptions.ts";
import { sessionHostSchema } from "./sessionReference.ts";

export const feedbackMaintenanceEndpoint = "/__feedback-maintenance";
export const feedbackMaintenanceSaveEndpoint = `${feedbackMaintenanceEndpoint}/save`;
export const feedbackMaintenanceRemoveEndpoint = `${feedbackMaintenanceEndpoint}/remove`;

// The project the cycle runs in: its configured local folder is where the
// session starts, and its host model choices are the ones offered here.
export const feedbackMaintenanceRepository = "terryyin/open-dough";

// What an On setting records, and what a save request carries.
export const feedbackMaintenanceChoiceSchema = z
  .object({
    host: sessionHostSchema.refine((host) => launchHosts.includes(host)),
    model: launchSettingSchema.optional(),
    effort: launchSettingSchema.optional(),
  })
  .strict()
  .refine((choice) => choice.effort === undefined || choice.host === "codex");
export type FeedbackMaintenanceChoice = z.infer<
  typeof feedbackMaintenanceChoiceSchema
>;

export const feedbackMaintenanceSettingSchema = z.union([
  z.object({ enabled: z.literal(false) }).strict(),
  z
    .object({
      enabled: z.literal(true),
      choice: feedbackMaintenanceChoiceSchema,
    })
    .strict(),
]);
export type FeedbackMaintenanceSetting = z.infer<
  typeof feedbackMaintenanceSettingSchema
>;

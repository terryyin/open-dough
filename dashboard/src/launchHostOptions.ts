// Transient installed-host picker data, never a persisted model catalog.
import { z } from "zod";
export const launchHostOptionsEndpoint = "/__agent-launch/host-options";
export const launchSettingSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[^\r\n]*$/);
// Retain the model contract for callers that only carry model identity.
export const launchModelSchema = launchSettingSchema;
export const launchHostOptionsSchema = z.object({
  configuredModel: launchModelSchema.optional(),
  models: z.array(
    z.object({
      model: launchModelSchema,
      name: z.string(),
      description: z.string(),
      efforts: z.array(
        z.object({ effort: z.string(), description: z.string() }),
      ),
    }),
  ),
});
export type LaunchHostOptions = z.infer<typeof launchHostOptionsSchema>;

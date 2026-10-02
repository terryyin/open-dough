// Transient installed-host picker data, never a persisted model catalog.
import { z } from "zod";
export const launchHostOptionsEndpoint = "/__agent-launch/host-options";
export const launchModelSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[^\r\n]*$/);
export const launchHostOptionsSchema = z.object({
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

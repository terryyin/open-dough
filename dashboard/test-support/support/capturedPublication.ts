// The publication envelope with its recorded landing, free of any test runner
// so Playwright and Vitest specs read it alike.
import { z } from "zod";
import { landingReceiptSchema } from "../../src/launchLanding.ts";

// Keep the CLI envelope intact while typing its existing public landing receipt.
export const capturedPublicationSchema = z.looseObject({
  landing: z.object({
    state: z.literal("recorded"),
    receipt: landingReceiptSchema,
  }),
});

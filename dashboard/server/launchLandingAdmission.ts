// Landing request body shape for prepare and record routes.
import { z } from "zod";
import { launchLandingSchema } from "../src/launchLanding.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";

export const landingSubmissionSchema = launchLandingSchema
  .omit({ repository: true, receipt: true, receivedAt: true })
  .extend({ source: z.string().min(1), host: sessionHostSchema })
  .strict();
export type LandingSubmission = z.infer<typeof landingSubmissionSchema>;

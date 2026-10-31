// Which observation of the machine's sessions an answer reports
// (`../server/machineSessionObservation.ts`). A full answer carries its
// revision. A viewer naming in `sessionsRevisionHeader` the revision it holds
// is answered only that it is unchanged while that observation still stands,
// and with the full answer otherwise. A read naming none is answered in full.
// A read that also names `sessionsFreshHeader` must be answered by an
// observation begun after that read arrived.

import { z } from "zod";
import { launchRecordsSchema } from "./agentLaunch.ts";

export const sessionsRevisionHeader = "x-open-dough-sessions-revision";
export const sessionsFreshHeader = "x-open-dough-sessions-fresh";

// A full answer, whose revision is absent when it was not observed as one,
// or the word that the held revision still stands.
export const machineSessionsReadSchema = z.union([
  z.object({ unchanged: z.literal(true), revision: z.string().min(1) }),
  launchRecordsSchema.extend({ revision: z.string().min(1).optional() }),
]);

export type MachineSessionsRead = z.infer<typeof machineSessionsReadSchema>;

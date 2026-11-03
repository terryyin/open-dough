// Which observation of the machine's sessions an answer reports
// (`../server/machineSessionObservation.ts`). A full answer carries its
// revision. A viewer naming in `sessionsRevisionHeader` the revision it holds
// is answered only that it is unchanged while that observation still stands,
// and with the full answer otherwise. A read naming none is answered in full.
// A read that also names `sessionsFreshHeader` must be answered by an
// observation begun after that read arrived.
// A read naming `sessionsHistoryAudience` in `sessionsAudienceParameter` is
// answered the machine's sessions history instead: every retained done
// session in full and the resolved attempts, under the history's own
// revision, which every full answer names as `historyRevision`; the same
// header rules apply to it. Any other audience is refused. The browser keeps
// a done session of a full answer only as its listing facts
// (`./doneSessionListing.ts`); its full entry is the history's.

import { z } from "zod";
import { launchRecordsSchema, launchWithStateSchema } from "./agentLaunch.ts";
import { doneListing } from "./doneSessionListing.ts";

export const sessionsRevisionHeader = "x-open-dough-sessions-revision";
export const sessionsFreshHeader = "x-open-dough-sessions-fresh";
export const sessionsAudienceParameter = "audience";
export const sessionsHistoryAudience = "history";

const unchangedSchema = z.object({
  unchanged: z.literal(true),
  revision: z.string().min(1),
});

// A full answer, whose revision is absent when it was not observed as one,
// with its done sessions as listing facts and the history's revision, or the
// word that the held revision still stands.
export const machineSessionsReadSchema = z.union([
  unchangedSchema,
  launchRecordsSchema
    .extend({
      revision: z.string().min(1).optional(),
      historyRevision: z.string().min(1).optional(),
    })
    .transform((answer) => ({
      ...answer,
      records: answer.records.map(doneListing),
    })),
]);

export type MachineSessionsRead = z.infer<typeof machineSessionsReadSchema>;

// The retained done sessions in full under the history's revision, or the
// word that the held history revision still stands.
export const sessionsHistoryReadSchema = z.union([
  unchangedSchema,
  z.object({
    revision: z.string().min(1),
    records: z.array(launchWithStateSchema),
  }),
]);

export type SessionsHistoryRead = z.infer<typeof sessionsHistoryReadSchema>;

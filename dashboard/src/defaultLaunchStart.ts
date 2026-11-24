// Where a default launch started: an unattached launch with the default
// choices establishes no session (`./unattachedSession.ts`) and opens in the
// project's execution checkout as it is. Its record keeps that checkout and
// the revision its `HEAD` named when the launch began, under the names an
// established session keeps its own by, so what the session later committed
// there is read from either.

import { z } from "zod";

export const defaultLaunchStartSchema = z.object({
  workspace: z.string().min(1),
  startingRevision: z.string().min(1),
  repository: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
});

export type DefaultLaunchStart = z.infer<typeof defaultLaunchStartSchema>;

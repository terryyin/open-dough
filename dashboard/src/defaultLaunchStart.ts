// Where a default launch started: an unattached launch with the default
// choices establishes no session (`./unattachedSession.ts`) and opens in the
// project's execution checkout as it is. Its record keeps the place used
// for shared-checkout notes and for authorizing a declared branch.

import { z } from "zod";

export const defaultLaunchStartSchema = z.object({
  workspace: z.string().min(1),
  repository: z.string().min(1).optional(),
});

export type DefaultLaunchStart = z.infer<typeof defaultLaunchStartSchema>;

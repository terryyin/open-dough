// The start a default launch keeps (`../src/defaultLaunchStart.ts`): read
// from the project's default checkout before the native session begins. An
// established launch keeps its own start, and a checkout Git cannot read
// keeps none.

import type { RecordedLaunchRequest } from "../src/agentLaunch.ts";
import { establishesSession } from "../src/unattachedSession.ts";
import { checkoutHead } from "./defaultCheckoutChanges.ts";
import type { LaunchStartFacts } from "./launchRecord.ts";
import type { ProjectFolder } from "./projectFolders.ts";

export async function defaultLaunchStartFacts(
  request: RecordedLaunchRequest,
  checkout: ProjectFolder,
): Promise<LaunchStartFacts> {
  if (request.workflow !== "ad-hoc" || establishesSession(request)) return {};
  try {
    return {
      defaultStart: {
        workspace: checkout.path,
        startingRevision: (await checkoutHead(checkout)).trim(),
      },
    };
  } catch {
    return {};
  }
}

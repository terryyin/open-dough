// The execution checkout and repository that own a default launch.
import type { RecordedLaunchRequest } from "../src/agentLaunch.ts";
import { establishesSession } from "../src/unattachedSession.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { defaultGitOutputLimit } from "./gitRunner.ts";
import type { LaunchStartFacts } from "./launchRecord.ts";
import type { LocalFolder } from "./localFolder.ts";

export async function defaultLaunchStartFacts(
  request: RecordedLaunchRequest,
  checkout: LocalFolder,
): Promise<LaunchStartFacts> {
  if (request.workflow !== "ad-hoc" || establishesSession(request)) return {};
  const defaultStart = await executionCheckoutStart(checkout.path);
  return defaultStart.repository === undefined ? {} : { defaultStart };
}

export async function executionCheckoutStart(workspace: string) {
  const repository = await commonGitDirectory({
    cwd: workspace,
    maxBuffer: defaultGitOutputLimit,
    signal: AbortSignal.timeout(30_000),
  }).catch(() => undefined);
  return { workspace, repository };
}

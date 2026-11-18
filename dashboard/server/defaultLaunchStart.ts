// The start a default launch keeps (`../src/defaultLaunchStart.ts`): read
// from the project's default checkout before the native session begins. An
// established launch keeps its own start, and a checkout Git cannot read
// keeps none.

import type { RecordedLaunchRequest } from "../src/agentLaunch.ts";
import { establishesSession } from "../src/unattachedSession.ts";
import { checkoutHead } from "./defaultCheckoutChanges.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import type { LaunchStartFacts } from "./launchRecord.ts";
import type { ProjectFolder } from "./projectFolders.ts";

export async function defaultLaunchStartFacts(
  request: RecordedLaunchRequest,
  checkout: ProjectFolder,
): Promise<LaunchStartFacts> {
  if (request.workflow !== "ad-hoc" || establishesSession(request)) return {};
  try {
    return {
      defaultStart: await defaultCheckoutStart(
        checkout.path,
        (await checkoutHead(checkout)).trim(),
      ),
    };
  } catch {
    return {};
  }
}

export async function defaultCheckoutStart(
  workspace: string,
  startingRevision: string,
) {
  const call = {
    cwd: workspace,
    maxBuffer: defaultGitOutputLimit,
    signal: AbortSignal.timeout(30_000),
  };
  const [repository, branch] = await Promise.all([
    commonGitDirectory(call).catch(() => undefined),
    runGit(["symbolic-ref", "HEAD"], call)
      .then(({ stdout }) => stdout.trim())
      .catch(() => undefined),
  ]);
  return { workspace, startingRevision, repository, branch };
}

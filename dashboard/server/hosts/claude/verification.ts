// Which sessions an uncertain Claude Code launch could have started, from
// Claude Code's own session listing (`./runtime.ts`), for a recheck that
// settles it (`../../launchVerification.ts`): those listed with the launch's
// name (`claudeSessionName`), started in the folder it started in, at or
// after `since`. Which of them other launch records hold, and what the
// answer settles, is decided by the caller.

import { realpath } from "node:fs/promises";
import type { RecordedLaunchRequest } from "../../../src/agentLaunch.ts";
import type { PublishedSource } from "../../../src/publishedSource.ts";
import type { SessionObservation } from "../../hostLaunch.ts";
import type { ProjectFolder } from "../../projectFolders.ts";
import { claudeSessionName } from "./launch.ts";
import { claudeSessions } from "./runtime.ts";

// The folder as the file system resolves it, so a listed working directory
// and the folder a launch started in compare through symbolic links; as given
// when it cannot be resolved.
async function resolved(folder: string): Promise<string> {
  try {
    return await realpath(folder);
  } catch {
    return folder;
  }
}

// The listed sessions this launch could have started, or undefined when the
// listing could not be read. The listing is asked in the project folder, as
// a launch's confirmation asks it.
export async function claudeLaunchedSessions(
  source: PublishedSource,
  request: RecordedLaunchRequest,
  startedIn: ProjectFolder,
  since: Date,
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<readonly SessionObservation[] | undefined> {
  const listed = await claudeSessions(folder, signal);
  if (listed === undefined) return undefined;
  const name = claudeSessionName(source, request);
  const where = await resolved(startedIn.path);
  const matching: SessionObservation[] = [];
  for (const entry of listed) {
    if (
      entry.session.name === name &&
      entry.cwd !== undefined &&
      entry.startedAt !== undefined &&
      entry.startedAt >= since.getTime() &&
      (await resolved(entry.cwd)) === where
    )
      matching.push({
        session: entry.session,
        sessionState: entry.sessionState,
      });
  }
  return matching;
}

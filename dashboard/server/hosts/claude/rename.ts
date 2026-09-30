// Claude Code's native /rename interaction and confirmation through its listing.
import { setTimeout as delay } from "node:timers/promises";
import type { LaunchRecord } from "../../../src/agentLaunch.ts";
import type { SessionReference } from "../../../src/sessionReference.ts";
import { doneSessionName } from "../../../src/doneMark.ts";
import type { ProjectFolder } from "../../projectFolders.ts";
import { claudeSessions } from "./runtime.ts";

const defaultRenameWaitMs = 5_000;

// Between the keys typed into Claude Code's prompt, as observed to work.
const keyPauseMs = 300;

const listingPollMs = 250;

// How long Mark as done waits for Claude Code to list the new name. A test
// may shorten it through the environment.
function renameWaitMs(): number {
  const configured = Number(process.env["DOUGH_DONE_RENAME_WAIT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultRenameWaitMs;
}

// A name that would type more than text into the terminal is not typed.
// eslint-disable-next-line no-control-regex
const controlCharacter = /[\u0000-\u001f\u007f-\u009f]/;

// Renames the session through its open attachment, if there is one, and
// waits until Claude Code lists the `done-` name or the wait expires.
export async function renameInClaudeCode(
  record: LaunchRecord,
  folder: ProjectFolder,
  type: (session: SessionReference, input: string) => boolean,
): Promise<void> {
  const { sessionId } = record.session;
  const name = doneSessionName(record.session);
  if (controlCharacter.test(name)) {
    return;
  }
  for (const [index, keys] of ["\u0015", `/rename ${name}`, "\r"].entries()) {
    if (index > 0) {
      await delay(keyPauseMs);
    }
    if (!type(record.session, keys)) {
      return;
    }
  }
  const deadline = Date.now() + renameWaitMs();
  for (;;) {
    const listed = await claudeSessions(
      folder,
      AbortSignal.timeout(Math.max(1, deadline - Date.now())),
    );
    if (
      listed?.some(
        (entry) =>
          entry.session.sessionId === sessionId && entry.session.name === name,
      )
    ) {
      return;
    }
    if (Date.now() + listingPollMs >= deadline) {
      return;
    }
    await delay(listingPollMs);
  }
}

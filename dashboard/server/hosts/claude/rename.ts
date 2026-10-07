// Claude Code's native /rename interaction and confirmation through its listing.
import { setTimeout as delay } from "node:timers/promises";
import type { LaunchRecord } from "../../../src/agentLaunch.ts";
import { doneSessionName } from "../../../src/doneMark.ts";
import type { ProjectFolder } from "../../projectFolders.ts";
import { HostOperationFailure } from "../../hostLaunch.ts";
import type { DoneIntent, WithAttachment } from "../../launchHosts.ts";
import { claudeSessions } from "./runtime.ts";

// Manual Done waits briefly; a reporting session still prints its final
// response after its receipt, so its rename waits longer.
const defaultRenameWaitMs: Readonly<Record<DoneIntent, number>> = {
  manual: 5_000,
  reporting: 60_000,
};

// Between the keys typed into Claude Code's prompt, as observed to work.
const keyPauseMs = 300;

const idlePollMs = 1_000;

const listingPollMs = 250;

// How long one rename attempt waits for the session to be idle, its
// attachment to open, and Claude Code to list the new name. A test may
// shorten it through the environment.
function renameWaitMs(intent: DoneIntent): number {
  const configured = Number(process.env["DOUGH_DONE_RENAME_WAIT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultRenameWaitMs[intent];
}

// A name that would type more than text into the terminal is not typed.
// eslint-disable-next-line no-control-regex
const controlCharacter = /[\u0000-\u001f\u007f-\u009f]/;

// Once Claude Code lists the session idle, renames it through its open
// attachment, or a private one, and waits until Claude Code lists the
// `done-` name, all within one wait. A session running a turn is never
// typed into.
export async function renameInClaudeCode(
  record: LaunchRecord,
  folder: ProjectFolder,
  withAttachment: WithAttachment,
  intent: DoneIntent,
): Promise<void> {
  const name = doneSessionName(record.session);
  if (controlCharacter.test(name)) {
    throw new HostOperationFailure(
      "The native name contains terminal control characters.",
    );
  }
  const deadline = Date.now() + renameWaitMs(intent);
  await waitForIdle(record, folder, deadline);
  await withAttachment(
    record.session,
    folder,
    async (type) => {
      const typed = ["\u0015", `/rename ${name}`, "\r"];
      for (const [index, keys] of typed.entries()) {
        if (index > 0) {
          await delay(keyPauseMs);
        }
        type(keys);
      }
      await confirmListed(record, folder, name, deadline);
    },
    remaining(deadline),
  );
}

// What is left of the rename wait, for one listing read or the attachment.
function remaining(deadline: number): AbortSignal {
  return AbortSignal.timeout(Math.max(1, deadline - Date.now()));
}

// Waits until Claude Code lists this session idle. `busy` and `waiting` are
// a running turn; no `status`, or no entry, is a process that has exited.
function waitForIdle(
  record: LaunchRecord,
  folder: ProjectFolder,
  deadline: number,
): Promise<void> {
  const { sessionId } = record.session;
  return pollListing(
    folder,
    deadline,
    idlePollMs,
    (listed) => {
      if (listed === undefined) return false;
      const status = listed.find(
        (entry) => entry.session.sessionId === sessionId,
      )?.status;
      if (status === undefined) {
        throw new HostOperationFailure(
          "The session is no longer running, so it was not renamed.",
        );
      }
      return status === "idle";
    },
    (listed) =>
      listed === undefined
        ? "The native rename could not be confirmed."
        : "The session was still working when the wait ended.",
  );
}

// Waits until Claude Code lists `name` for this session, within the rename wait.
function confirmListed(
  record: LaunchRecord,
  folder: ProjectFolder,
  name: string,
  deadline: number,
): Promise<void> {
  const { sessionId } = record.session;
  return pollListing(
    folder,
    deadline,
    listingPollMs,
    (listed) =>
      listed?.some(
        (entry) =>
          entry.session.sessionId === sessionId && entry.session.name === name,
      ) === true,
    () => "The native rename could not be confirmed.",
  );
}

type Listing = Awaited<ReturnType<typeof claudeSessions>>;

// Reads Claude Code's listing every `pollMs` until `settled` accepts it, or
// fails with what `expired` names once another read would pass `deadline`.
async function pollListing(
  folder: ProjectFolder,
  deadline: number,
  pollMs: number,
  settled: (listed: Listing) => boolean,
  expired: (listed: Listing) => string,
): Promise<void> {
  for (;;) {
    const listed = await claudeSessions(folder, remaining(deadline));
    if (settled(listed)) return;
    if (Date.now() + pollMs >= deadline) {
      throw new HostOperationFailure(expired(listed));
    }
    await delay(pollMs);
  }
}

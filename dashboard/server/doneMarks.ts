// Mark as done for the local launch boundary (`./agentLaunchPlugin.ts`), on a
// session this dashboard recorded for the project, in its existing folder
// (`./agentLaunches.ts`). While the page's terminal is attached to the
// session (`./agentTerminals.ts`), it types Claude Code's own rename into it
// -- Ctrl+U to clear any draft, `/rename done-<name>` built only from the
// recorded launch name, then Enter, with a short pause between -- and waits
// briefly for Claude Code's listing to show the new name. A busy session
// queues the command until its turn ends, so the wait may expire; then, as
// with no terminal open, the `done-` name is only the record's. Either way it
// marks the record done (`./launchRecordStore.ts`) and ends every attachment
// to the session. It runs `claude stop <short id>` (`./claudeCode.ts`) unless
// the session's state, read then through the records' join with Claude Code's
// listing, is unlisted, which then only records its done time; a session whose
// listing cannot be read is still stopped. The mark is local evidence only and
// never changes a story fact.

import { setTimeout as delay } from "node:timers/promises";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { doneSessionName } from "../src/doneMark.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { AgentTerminals } from "./agentTerminals.ts";
import { claudeSessions, stopClaude } from "./claudeCode.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";
import type { ProjectFolder } from "./projectFolders.ts";

const defaultRenameWaitMs = 5_000;

// Between the keys typed into Claude Code's prompt, as observed to work.
const keyPauseMs = 300;

const listingPollMs = 250;

const stopWaitMs = 10_000;

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
async function renameInClaudeCode(
  record: LaunchRecord,
  folder: ProjectFolder,
  terminals: AgentTerminals,
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
    if (!terminals.type(sessionId, keys)) {
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

// Marks the recorded session done and stops it unless Claude Code no longer
// lists it, answering the marked record.
export async function markSessionDone(
  source: PublishedSource,
  record: LaunchRecord,
  folder: ProjectFolder,
  launches: AgentLaunches,
  terminals: AgentTerminals,
): Promise<LaunchRecord> {
  await renameInClaudeCode(record, folder, terminals);
  const doneAt = new Date().toISOString();
  const marked =
    (await setRecordDoneAt(source.id, record.session.sessionId, doneAt)) ??
    ({ ...record, doneAt } satisfies LaunchRecord);
  terminals.endAttachments(record.session.sessionId);
  const { sessionState } = await launches.stateOf(source, record);
  if (sessionState.kind !== "unlisted") {
    await stopClaude(
      record.session.shortId,
      folder,
      AbortSignal.timeout(stopWaitMs),
    );
  }
  return marked;
}

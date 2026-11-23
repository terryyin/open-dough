import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { codexHost } from "../../server/codexHost.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { hostOperations } from "../../server/launchHosts.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { setRecordDoneAt } from "../../server/launchRecordStore.ts";
import {
  configuredProjects,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { machineFolder } from "../../server/projectFolders.ts";
import { recordDeletable, type LaunchRecord } from "../../src/launchRecord.ts";
import { offersFollowUp, sessionAccess } from "../../src/sessionAccess.ts";
import { sessionShown } from "../../src/sessionShown.ts";

test("recurring observation reads open Codex conversations and resumes reading the same session after Done clears", async () => {
  const home = mkdtempSync(path.join(tmpdir(), "open-dough-codex-polling-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  const unmount = mountProjectConfiguration("production");
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  const batches: string[][] = [];
  const working = makeMe.aSessionState.loaded("working").please();
  const sessions = vi
    .spyOn(codexHost, "sessions")
    .mockImplementation((records) => {
      batches.push(records.map(({ session }) => session.sessionId));
      return Promise.resolve(
        records.map(({ session }) => ({ session, sessionState: working })),
      );
    });
  const prepare = vi
    .spyOn(codexHost, "prepareSavedSessions")
    .mockResolvedValue(undefined);
  const source = configuredProjects().find(({ id }) => id === "open-dough");
  if (source === undefined) throw new Error("Missing configured project");
  const launch = (sessionId: string) =>
    makeMe.aLaunchRecord.adHoc({ title: sessionId }).inCodexSession({
      sessionId,
      continuation: {
        workspace: home,
        endpoint: "unix:///unused-codex.sock",
        args: [],
      },
    });
  const older = new Date(Date.now() - 60_000).toISOString();
  const retained: LaunchRecord[] = [];
  for (let index = 0; index < 427; index += 1) {
    retained.push(
      launch(`saved-${index}`).launchedAt(older).markedDone().please(),
    );
  }
  const open = launch("open").launchedAt(new Date().toISOString()).please();
  await replaceRecords(() => ({ [source.id]: [...retained, open] }));
  const launches = new AgentLaunches(marks);
  try {
    const rows = await launches.machineSessions();
    expect(batches).toEqual([["open"]]);
    expect(
      rows.map((row) => [row.session.sessionId, sessionShown(row).label]),
    ).toEqual([
      ...retained.map((record) => [record.session.sessionId, "Done"]),
      ["open", "Working"],
    ]);
    const [saved] = rows;
    if (saved === undefined) throw new Error("Missing retained row");
    const operations = hostOperations();
    expect(sessionAccess(saved, operations)).toBe("terminal");
    expect(offersFollowUp([saved], operations)).toBe(false);
    expect(recordDeletable(saved)).toBe(false);

    const observed = await launches.stateOf(source, saved);
    expect(batches).toEqual([["open"], ["saved-0"]]);
    expect(observed.sessionState).toEqual(working);

    await setRecordDoneAt(source.id, saved.session, undefined);
    const reopenedRows = await launches.machineSessions();
    expect(batches).toEqual([["open"], ["saved-0"], ["saved-0", "open"]]);
    expect(
      reopenedRows
        .filter((record) => record.doneAt === undefined)
        .map((record) => [
          record.session.sessionId,
          sessionShown(record).label,
        ]),
    ).toEqual([
      ["saved-0", "Working"],
      ["open", "Working"],
    ]);
  } finally {
    launches.close();
    sessions.mockRestore();
    prepare.mockRestore();
    unmount();
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  }
});

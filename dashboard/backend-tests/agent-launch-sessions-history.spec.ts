// A sessions ask naming the history audience is answered the machine's
// retained done sessions in full and the attempts that no longer need
// attention, under the history's own revision, which the regular answer
// names; the regular answer carries only the attempts that still do
// (../../src/launchAttemptSelection.ts,
// ../../src/machineSessionsRevision.ts,
// ../../server/machineSessionObservation.ts). A viewer holding the current
// history revision is answered only that it is unchanged; a change to an open
// session leaves it standing, and a session marked done or an attempt
// reconciled moves it. Any other audience is refused.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { launchRecordsSchema } from "../src/agentLaunch.ts";
import { attemptsNeedingAttention } from "../src/launchAttemptSelection.ts";
import type { AttemptObservation } from "../src/launchOutcome.ts";
import {
  machineSessionsReadSchema,
  sessionsRevisionHeader,
} from "../src/machineSessionsRevision.ts";
import { markDone, noteReconciled } from "../tests/agentLaunchBoundary.ts";
import { launched } from "../tests/agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../tests/support/dashboardServer.ts";
import { expect, test } from "../tests/support/pageTest.ts";
import { rawRequest } from "../tests/support/rawHttp.ts";
import { keepUnsettledAttempt } from "../tests/support/unsettledAttempt.ts";
import {
  type AnsweredEntry,
  withoutRetainedDetail,
} from "../tests/support/retainedDetail.ts";

type Entry = {
  readonly session: { readonly sessionId: string };
  readonly doneAt?: string;
};
type Answer = {
  readonly revision: string;
  readonly unchanged?: true;
  readonly historyRevision?: string;
  readonly records?: readonly Entry[];
  readonly attempts?: readonly AttemptObservation[];
};

async function ask(
  server: DashboardServer,
  options: { readonly audience?: string; readonly held?: string } = {},
) {
  const response = await rawRequest({
    url: `${server.baseURL}/__agent-launch${options.audience === undefined ? "" : `?audience=${options.audience}`}`,
    headers: {
      Origin: server.origin,
      ...(options.held === undefined
        ? {}
        : { [sessionsRevisionHeader]: options.held }),
    },
  });
  return { ...response, answer: JSON.parse(response.body) as Answer };
}

const history = (server: DashboardServer, held?: string) =>
  ask(server, { audience: "history", ...(held === undefined ? {} : { held }) });

// Each entry of a full answer body as it was sent, by session id.
const entriesIn = (body: string) =>
  new Map(
    (JSON.parse(body) as { records: Entry[] }).records.map((entry) => [
      entry.session.sessionId,
      JSON.stringify(entry),
    ]),
  );

const attemptIds = (answer: Answer) =>
  (answer.attempts ?? []).map(({ id }) => id).toSorted();

test.describe("the sessions history ask", () => {
  let machine: string;
  let server: DashboardServer;

  test.beforeEach(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-sessions-history-"));
    server = await startDashboardServer({
      mode: "boundary",
      machine,
      projectFolders: ["open-dough"],
    });
  });

  test.afterEach(async () => {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  });

  test("answers retained done sessions and attempts no longer needing attention under its own revision, which the regular answer names", async () => {
    const done = await launched(server);
    const open = await launched(server);
    expect(
      (
        await markDone(server, {
          source: "open-dough",
          session: done.sessionId,
        })
      ).status,
    ).toBe(200);
    const unsettled = keepUnsettledAttempt(server);
    // Both launches settled; no page has reconciled either with the
    // published snapshot yet, so both still need attention.
    const before = await ask(server);
    const attemptOf = (sessionId: string) =>
      (before.answer.attempts ?? []).find(
        ({ outcome }) =>
          outcome?.kind === "launched" &&
          outcome.session.sessionId === sessionId,
      )?.id ?? "";
    const doneAttempt = attemptOf(done.sessionId);
    const openAttempt = attemptOf(open.sessionId);
    expect(attemptIds(before.answer)).toEqual(
      [doneAttempt, openAttempt, unsettled].toSorted(),
    );
    // A page reconciles the open session's start: it no longer needs
    // attention. The done session's start shares its story with the
    // unsettled copy, which no server runs, so it still does.
    expect((await noteReconciled(server, openAttempt)).status).toBe(200);
    await expect
      .poll(async () => attemptIds((await ask(server)).answer))
      .toEqual([doneAttempt, unsettled].toSorted());

    const regular = await ask(server);
    expect(regular.status).toBe(200);
    const historyRevision = regular.answer.historyRevision ?? "";
    expect(historyRevision).toMatch(/^[0-9a-f]{64}$/);
    // The regular answer names it last, after the fields it always had,
    // and still reads as before.
    expect(
      regular.body.endsWith(
        `,"historyRevision":${JSON.stringify(historyRevision)}}`,
      ),
    ).toBe(true);
    expect(machineSessionsReadSchema.safeParse(regular.answer).success).toBe(
      true,
    );
    const regularRecords = launchRecordsSchema.parse(regular.answer).records;
    expect(regularRecords.map(({ session }) => session.sessionId)).toEqual([
      done.sessionId,
      open.sessionId,
    ]);
    expect(attemptIds(regular.answer)).toContain(unsettled);

    const asked = await history(server);
    expect(asked.status).toBe(200);
    expect(asked.answer.revision).toBe(historyRevision);
    expect(asked.answer.revision).not.toBe(regular.answer.revision);
    expect(
      asked.body.startsWith(
        `{"revision":${JSON.stringify(historyRevision)},"records":[`,
      ),
    ).toBe(true);
    // The done session's entry in full, which the regular answer lists
    // without its reporting handoff, first input's text and landing evidence
    // (agent-launch-sessions-listing.spec.ts).
    const full = entriesIn(asked.body).get(done.sessionId) ?? "{}";
    expect([...entriesIn(asked.body).keys()]).toEqual([done.sessionId]);
    expect(entriesIn(regular.body).get(done.sessionId)).toBe(
      JSON.stringify(withoutRetainedDetail(JSON.parse(full) as AnsweredEntry)),
    );
    // Each attempt is in exactly one of the two answers, as the selection
    // over all of them puts it.
    expect(attemptIds(asked.answer)).toEqual([openAttempt]);
    const all = [
      ...(regular.answer.attempts ?? []),
      ...(asked.answer.attempts ?? []),
    ];
    const attending = attemptsNeedingAttention(all);
    expect(attemptIds({ ...regular.answer, attempts: [...attending] })).toEqual(
      attemptIds(regular.answer),
    );
    expect(asked.answer.attempts?.[0]?.reconciledAt).toEqual(
      expect.any(String),
    );
    expect(Object.keys(asked.answer)).toEqual([
      "revision",
      "records",
      "attempts",
    ]);

    // Holding the history revision: unchanged, and only for the history.
    for (let repeat = 0; repeat < 2; repeat += 1)
      expect((await history(server, historyRevision)).answer).toEqual({
        revision: historyRevision,
        unchanged: true,
      });
    expect((await history(server, regular.answer.revision)).body).toBe(
      asked.body,
    );
    expect((await ask(server, { held: historyRevision })).body).toBe(
      regular.body,
    );

    // An open session's change moves the regular revision only.
    server.claudeSessionBecomes(open.sessionId, "blocked");
    await expect
      .poll(async () => (await ask(server)).answer.revision)
      .not.toBe(regular.answer.revision);
    expect((await ask(server)).answer.historyRevision).toBe(historyRevision);
    expect((await history(server, historyRevision)).answer.unchanged).toBe(
      true,
    );

    // A session marked done moves the history, which the regular answer names.
    expect(
      (
        await markDone(server, {
          source: "open-dough",
          session: open.sessionId,
        })
      ).status,
    ).toBe(200);
    const moved = await history(server, historyRevision);
    expect(moved.answer.unchanged).toBeUndefined();
    expect(moved.answer.revision).not.toBe(historyRevision);
    expect([...entriesIn(moved.body).keys()]).toEqual([
      done.sessionId,
      open.sessionId,
    ]);
    expect((await ask(server)).answer.historyRevision).toBe(
      moved.answer.revision,
    );
  });

  test("refuses an audience other than the history, as other malformed requests", async () => {
    for (const query of [
      "audience=overview",
      "audience=History",
      "audience=",
      "audience=history&audience=history",
    ]) {
      const response = await rawRequest({
        url: `${server.baseURL}/__agent-launch?${query}`,
        headers: { Origin: server.origin },
      });
      expect(response.status, query).toBe(400);
      expect(JSON.parse(response.body), query).toEqual({
        error: "The sessions request is malformed.",
      });
    }
  });
});

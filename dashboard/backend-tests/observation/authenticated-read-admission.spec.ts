// How the owner's admission (`ReadAdmission`,
// ../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-admission.mjs)
// holds back and resumes reads, driven with GitHub's answers as the installed
// parser reads them (`readAnswer`) and explicit clock inputs: a directed or
// backed-off wait holds every read, including those waiting their turn, while
// reads already asked keep their own answers and only a later time moves the
// wait; the undirected wait starts at its base, doubles up to an hour and
// resets after a success; once a wait ends one read goes first, and its new
// limit holds the rest while any other ending reopens the turns; ordinary
// failures hold back nothing. The owner protocol across processes:
// ../../../Distribution/tests/skills/dough-execute-plan/github-request-owner.test.mjs.
// What each read reports: ./authenticated-read-failure-report.spec.ts.

import { expect, test } from "vitest";
import { ReadAdmission } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-admission.mjs";
import { readAnswer } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-answer.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  commitAnswer,
  httpErrorAnswer,
  noConnection,
  notFoundAnswer,
  rateLimitedAnswer,
  type OriginAnswer,
} from "../../test-support/originAnswers.ts";
import { asGhReply } from "../../test-support/support/ghReply.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

const minuteMs = 60_000;
const turns = 8;
const call = [
  "api",
  "--include",
  `repos/${makeMe.aPublishedSource.openDough.please().repository}/commits/main`,
];

// GitHub's `answer` to one call asked at `askedMs`, as the owner reads what
// `gh` printed of it.
function answer(askedMs: number, origin: OriginAnswer) {
  const printed = asGhReply(call, parseRequest(call), origin);
  return readAnswer(
    printed.exitCode === 0 ? null : { code: printed.exitCode },
    printed.stdout,
    printed.stderr,
    new Date(askedMs).toISOString(),
    askedMs,
  );
}
const succeeded = (askedMs: number) =>
  answer(askedMs, commitAnswer("c3".repeat(20)));
const directed = (askedMs: number, seconds: number) =>
  answer(askedMs, rateLimitedAnswer(429, { "Retry-After": String(seconds) }));
const undirected = (askedMs: number) => answer(askedMs, rateLimitedAnswer());
const unanswered = (askedMs: number) => answer(askedMs, noConnection);

function waitOf(settled: ReturnType<ReadAdmission["answered"]>) {
  return settled.failure?.kind === "rate-limited"
    ? settled.failure.waitSeconds
    : undefined;
}

// Which of `pending` have settled once queued callbacks have run.
async function settledOf(pending: readonly Promise<unknown>[]) {
  const settled = pending.map(() => false);
  pending.forEach((each, index) => {
    const mark = () => {
      settled[index] = true;
    };
    void each.then(mark, mark);
  });
  await new Promise((resolve) => setImmediate(resolve));
  return settled;
}

const open = () => new AbortController().signal;

test("an undirected limit waits the base, doubles while it continues up to an hour, and a success resets it", () => {
  const admission = new ReadAdmission(minuteMs);
  let nowMs = Date.UTC(2026, 10, 27, 12);
  const backoffs: (number | undefined)[] = [];
  for (let limit = 0; limit < 8; limit += 1) {
    backoffs.push(waitOf(admission.answered(undirected(nowMs), nowMs)));
    nowMs += 2 * 60 * minuteMs;
  }
  expect(backoffs).toEqual([60, 120, 240, 480, 960, 1920, 3600, 3600]);

  admission.answered(succeeded(nowMs), nowMs);
  expect(waitOf(admission.answered(undirected(nowMs), nowMs))).toBe(60);
  expect(
    waitOf(new ReadAdmission(2 * 60 * minuteMs).answered(undirected(0), 0)),
  ).toBe(3600);
});

test("a wait holds back every later read until its time, a read already asked keeps its own answer, and only a later time moves the wait", () => {
  const admission = new ReadAdmission(minuteMs);
  const startMs = Date.UTC(2026, 10, 27, 12);
  expect(waitOf(admission.answered(directed(startMs, 300), startMs))).toBe(300);
  expect(admission.heldBack(startMs + 1)).toEqual({
    kind: "held-back",
    waitSeconds: 300,
  });

  // Asked before the wait began, these answer for themselves.
  const askedMs = startMs - 1_000;
  expect(admission.answered(succeeded(askedMs), startMs + 10).failure).toBe(
    undefined,
  );
  expect(waitOf(admission.answered(directed(askedMs, 60), startMs + 10))).toBe(
    60,
  );
  expect(admission.heldBack(startMs + 10)).toMatchObject({ waitSeconds: 300 });
  // An undirected limit met in flight reports what is left without doubling.
  expect(
    waitOf(admission.answered(undirected(askedMs), startMs + 100_000)),
  ).toBe(200);
  expect(waitOf(admission.answered(directed(askedMs, 900), startMs + 10))).toBe(
    900,
  );
  expect(admission.heldBack(startMs + 899_000)).toMatchObject({
    waitSeconds: 2,
  });
  expect(admission.heldBack(startMs + 900_010)).toBeUndefined();
});

test("a wait that starts while reads wait their turn gives every waiting read its turn at once, held back, while the reads under way keep theirs", async () => {
  const admission = new ReadAdmission(minuteMs);
  const underWay = await Promise.all(
    Array.from({ length: turns }, () => admission.turn(open())),
  );
  const queued = [admission.turn(open()), admission.turn(open())];
  expect(await settledOf(queued)).toEqual([false, false]);

  const nowMs = Date.now();
  admission.answered(directed(nowMs, 600), nowMs);
  underWay[0]?.();
  expect(await settledOf(queued)).toEqual([true, true]);
  expect(admission.heldBack(Date.now())).toMatchObject({ waitSeconds: 600 });
  // The seven other reads still hold their turns, to end with their answers.
  expect(await settledOf([admission.turn(open())])).toEqual([false]);
});

test("a read waiting its turn whose requester leaves gives its place to the next", async () => {
  const admission = new ReadAdmission(minuteMs);
  const underWay = await Promise.all(
    Array.from({ length: turns }, () => admission.turn(open())),
  );
  const leaving = new AbortController();
  const departed = admission.turn(leaving.signal);
  const next = admission.turn(open());
  leaving.abort(new Error("requester left"));
  await expect(departed).rejects.toThrow("requester left");
  underWay[0]?.();
  expect(await settledOf([next])).toEqual([true]);
});

// An admission whose wait, directed or backed off, has just ended.
function afterWait(limit: "directed" | "backed off") {
  const admission = new ReadAdmission(1_000);
  const metMs = Date.now() - 5_000;
  admission.answered(
    limit === "directed" ? directed(metMs, 1) : undirected(metMs),
    metMs,
  );
  expect(admission.heldBack(Date.now())).toBeUndefined();
  return admission;
}

for (const limit of ["directed", "backed off"] as const) {
  test(`after a ${limit} wait one read goes first, and its new limit holds back the rest`, async () => {
    const admission = afterWait(limit);
    const first = await admission.turn(open());
    const rest = [admission.turn(open()), admission.turn(open())];
    expect(await settledOf(rest)).toEqual([false, false]);

    const askedMs = Date.now();
    expect(waitOf(admission.answered(directed(askedMs, 600), askedMs))).toBe(
      600,
    );
    first();
    expect(await settledOf(rest)).toEqual([true, true]);
    expect(admission.heldBack(Date.now())).toMatchObject({ waitSeconds: 600 });
  });

  test(`after a ${limit} wait, the first read's answer opens the turns to the rest`, async () => {
    const admission = afterWait(limit);
    const first = await admission.turn(open());
    const rest = [admission.turn(open()), admission.turn(open())];
    expect(await settledOf(rest)).toEqual([false, false]);

    const askedMs = Date.now();
    admission.answered(succeeded(askedMs), askedMs);
    first();
    expect(await settledOf(rest)).toEqual([true, true]);
    expect(admission.heldBack(Date.now())).toBeUndefined();
  });
}

test.each([
  {
    ending: "GitHub is unreachable",
    end: (admission: ReadAdmission, askedMs: number) =>
      admission.answered(unanswered(askedMs), askedMs),
  },
  {
    ending:
      "its requester left, its owner disconnected or it reached its bound",
    end: (admission: ReadAdmission, askedMs: number) => {
      admission.endedUnanswered(new Date(askedMs).toISOString());
    },
  },
])(
  "after a wait, when the first read ends because $ending, the turns open to the rest",
  async ({ end }) => {
    const admission = afterWait("directed");
    const first = await admission.turn(open());
    const rest = [admission.turn(open()), admission.turn(open())];
    expect(await settledOf(rest)).toEqual([false, false]);

    end(admission, Date.now());
    first();
    expect(await settledOf(rest)).toEqual([true, true]);
  },
);

test.each([
  {
    failure: "an unmarked 403",
    met: (askedMs: number) =>
      answer(askedMs, httpErrorAnswer(403, "Forbidden")),
  },
  {
    failure: "a 404",
    met: (askedMs: number) => answer(askedMs, notFoundAnswer()),
  },
  { failure: "an unreachable GitHub", met: unanswered },
])(
  "$failure holds back nothing and leaves every turn open",
  async ({ met }) => {
    const admission = new ReadAdmission(minuteMs);
    const askedMs = Date.now();
    expect(admission.answered(met(askedMs), askedMs).failure?.kind).not.toBe(
      "rate-limited",
    );
    admission.endedUnanswered(new Date(askedMs).toISOString());
    expect(admission.heldBack(askedMs)).toBeUndefined();
    const all = Array.from({ length: turns }, () => admission.turn(open()));
    expect(await settledOf(all)).toEqual(all.map(() => true));
  },
);

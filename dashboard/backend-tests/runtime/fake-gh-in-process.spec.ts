// The owner's answer reading, admission and shared reads as typed values; the
// real owner process is proven by Distribution/tests/test-runner/fake-gh-real-owner.sh.
import { everyRepository } from "../../test-support/support/fakeGitHub.ts";
import { readAnswer } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-answer.mjs";
import { asGhReply } from "../../test-support/support/ghReply.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";
import { ReadAdmission } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-admission.mjs";
import { OutstandingReads } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-outstanding.mjs";
import { expect } from "vitest";
import { test } from "../support/fakeGhInProcess.ts";

test("status, headers and a directed rate limit are read as values and hold later reads until its time", () => {
  const argv = ["api", "--include", "repos/test/repo"];
  const reply = asGhReply(argv, parseRequest(argv), {
    status: 429,
    contentType: "application/json",
    headers: { "Retry-After": "60", "X-Custom": "retained" },
    body: '{"message":"rate limit"}',
  });
  const nowMs = 1_000_000;
  const answer = readAnswer(
    Object.assign(new Error("gh exited"), { code: reply.exitCode }),
    reply.stdout,
    reply.stderr,
    "asked",
    nowMs,
  );
  expect(answer).toMatchObject({
    status: 429,
    body: '{"message":"rate limit"}',
    failure: { kind: "rate-limited", status: 429, waitSeconds: 60 },
  });
  expect([...answer.headers]).toEqual([
    ["content-type", "application/json"],
    ["retry-after", "60"],
    ["x-custom", "retained"],
  ]);
  const admission = new ReadAdmission(1);
  admission.answered(answer, nowMs);
  expect(admission.heldBack(nowMs + 59_001)).toEqual({
    kind: "held-back",
    waitSeconds: 1,
  });
  expect(admission.heldBack(nowMs + 60_000)).toBeUndefined();
});

test("a held shared read survives one departure and ends after its last waiter leaves", async () => {
  const reads = new OutstandingReads<string>(60_000);
  const started: AbortSignal[] = [];
  const start = (signal: AbortSignal) => {
    started.push(signal);
    return new Promise<string>(() => undefined);
  };
  const [leaving, staying] = [new AbortController(), new AbortController()];
  const left = reads.waitFor("repo", leaving.signal, start).catch(() => "left");
  const stays = reads
    .waitFor("repo", staying.signal, start)
    .catch(() => "left");
  expect(started).toHaveLength(1);
  leaving.abort();
  expect(await left).toBe("left");
  expect(started[0]?.aborted).toBe(false);
  staying.abort();
  expect(await stays).toBe("left");
  expect(started[0]?.aborted).toBe(true);
});

test("oversized stdout and stderr each end the call as an output-bound read", async ({
  client,
}) => {
  for (const answer of [
    { status: 200, contentType: "text/plain", body: "x".repeat(2048) },
    { exitCode: 7, stderr: "x".repeat(2048) },
  ]) {
    client.github.serve(everyRepository, () => Promise.resolve(answer));
    const { error, stdout, stderr } = await client.raw(["api"], {
      maxBuffer: 1024,
    });
    expect(
      readAnswer(error, stdout.toString(), stderr.toString(), "asked").failure,
    ).toEqual({
      kind: "output-bound",
    });
  }
  await expect
    .poll(() => client.github.unansweredCalls, { interval: 5 })
    .toBe(0);
});

test("the owner admits eight calls and queues the ninth until a turn ends", async () => {
  const admission = new ReadAdmission(1);
  const turns = await Promise.all(
    [...Array<unknown>(8).keys()].map(() =>
      admission.turn(new AbortController().signal),
    ),
  );
  let ninthAdmitted = false;
  const ninth = admission.turn(new AbortController().signal).then((end) => {
    ninthAdmitted = true;
    return end;
  });
  await Promise.resolve();
  expect(ninthAdmitted).toBe(false);
  turns[0]?.();
  (await ninth)();
  expect(ninthAdmitted).toBe(true);
});

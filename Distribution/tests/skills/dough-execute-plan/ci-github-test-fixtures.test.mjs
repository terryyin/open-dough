import assert from "node:assert/strict";
import { appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";

test("a GitHub fixture journal opened before its first append has no completed calls", (t) => {
  const github = instrumentedGithubFixture(t, {});
  assert.deepEqual(github.calls(), []);

  writeFileSync(join(github.env.CI_GH_FIXTURE, "calls.jsonl"), "");
  assert.deepEqual(github.calls(), []);
});

test("completed GitHub calls remain visible while the next journal record is being appended", (t) => {
  const github = instrumentedGithubFixture(t, {});
  const journal = join(github.env.CI_GH_FIXTURE, "calls.jsonl");
  const asked = {
    args: ["api", "--include", "repos/owner/repo"],
    phase: "asked",
  };
  const answered = { ...asked, phase: "answered" };
  const line = JSON.stringify(answered);
  writeFileSync(journal, `${JSON.stringify(asked)}\n${line.slice(0, -1)}`);

  assert.deepEqual(github.calls(), [asked]);
  assert.deepEqual(github.asked(), [asked.args.join(" ")]);
  assert.equal(github.mostUnderWay(), 1);

  appendFileSync(journal, line.slice(-1));
  assert.deepEqual(github.calls(), [asked]);
  appendFileSync(journal, "\n");
  assert.deepEqual(github.calls(), [asked, answered]);
});

test("a malformed completed GitHub fixture record still fails", (t) => {
  const github = instrumentedGithubFixture(t, {});
  writeFileSync(join(github.env.CI_GH_FIXTURE, "calls.jsonl"), '{"phase":\n');
  assert.throws(() => github.calls(), SyntaxError);
});

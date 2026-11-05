// The dashboard process's kept CI status answers
// (../../dashboard/server/intentCiStatusAnswers.ts): keyed by repository,
// judged branch and CI reading path; replaced by a keepable fresh answer;
// not replaced by an unread one.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ciStatusAnswerKey,
  clearCiStatusAnswers,
  keepCiStatusAnswer,
  keptCiStatusAnswer,
} from "../../dashboard/server/intentCiStatusAnswers.ts";

const pass = {
  branch: "main",
  checkedAt: "2026-11-05T10:00:00.000Z",
  state: "pass",
  revision: "a".repeat(40),
  subject: "Add login",
  laterWithoutResult: 0,
};

const failed = {
  ...pass,
  checkedAt: "2026-11-05T10:20:00.000Z",
  state: "failed",
  subject: "Break the login",
};

const unread = {
  branch: "main",
  checkedAt: "2026-11-05T10:30:00.000Z",
  state: "unread",
  revision: "unavailable",
  subject: "(unavailable)",
  laterWithoutResult: 0,
  reason: "The Actions runs could not be read",
};

test.beforeEach(() => {
  clearCiStatusAnswers();
});

test("a kept answer is keyed by repository, judged branch and reading path", () => {
  const mainGithub = ciStatusAnswerKey("TerryYin/open-dough", "main", "github");
  const mainAdapter = ciStatusAnswerKey(
    "terryyin/open-dough",
    "main",
    "ciAdapter",
  );
  const storyGithub = ciStatusAnswerKey(
    "terryyin/open-dough",
    "codex/example-story",
    "github",
  );
  keepCiStatusAnswer(mainGithub, pass);
  keepCiStatusAnswer(mainAdapter, { ...pass, ciAdapter: true });
  keepCiStatusAnswer(storyGithub, failed);
  assert.equal(keptCiStatusAnswer(mainGithub)?.state, "pass");
  assert.equal(keptCiStatusAnswer(mainAdapter)?.ciAdapter, true);
  assert.equal(keptCiStatusAnswer(storyGithub)?.state, "failed");
  assert.equal(
    keptCiStatusAnswer(ciStatusAnswerKey("other/repo", "main", "github")),
    undefined,
  );
});

test("a keepable fresh answer replaces the kept one for that key", () => {
  const key = ciStatusAnswerKey("terryyin/open-dough", "main", "github");
  keepCiStatusAnswer(key, pass);
  keepCiStatusAnswer(key, failed);
  assert.deepEqual(keptCiStatusAnswer(key), failed);
});

test("an unread answer does not replace a kept one", () => {
  const key = ciStatusAnswerKey("terryyin/open-dough", "main", "github");
  keepCiStatusAnswer(key, pass);
  keepCiStatusAnswer(key, unread);
  assert.deepEqual(keptCiStatusAnswer(key), pass);
  assert.equal(
    keptCiStatusAnswer(
      ciStatusAnswerKey("terryyin/open-dough", "other", "github"),
    ),
    undefined,
  );
  keepCiStatusAnswer(
    ciStatusAnswerKey("terryyin/open-dough", "other", "github"),
    unread,
  );
  assert.equal(
    keptCiStatusAnswer(
      ciStatusAnswerKey("terryyin/open-dough", "other", "github"),
    ),
    undefined,
  );
});

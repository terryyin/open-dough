// Guidance structure (not native agent evidence): the shared closing-response
// rule that Dough Land and Story Wrap Up apply after their operations settle.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const attention = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../references/completion-attention.md",
  ),
  "utf8",
);

test("a session whose checkout retirement removed closes as finished with stated reminders", () => {
  const start = attention.indexOf("When retirement removed the checkout");
  assert.ok(start >= 0);
  const retired = attention.slice(start).split("\n- ")[0];

  assert.match(
    retired,
    /^When retirement removed the checkout this session ran in[\s\S]+State that the work is finished and where it landed, then list any\s+reminders/,
  );
  assert.match(
    retired,
    /each reminder as its fact, consequence, and next action with\s+its owner, for the developer to take up in a new session or by hand/,
  );
  assert.match(
    retired,
    /Ask no\s+question, request no decision from this session, and give no command for it to\s+run next/,
  );
  assert.match(
    retired,
    /record removed so Git can recover it as a fact, such as\s+"… stays recoverable at `<sha>`"/,
  );
  assert.match(
    retired,
    /While the checkout survives, because\s+retirement was held, a step remains unfinished, or the work is local-only, the\s+response may still ask for the input needed to continue/,
  );
  assert.doesNotMatch(retired, /dashboard|client project/i);
});

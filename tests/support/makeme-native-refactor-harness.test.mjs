import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  assessRefactorGuidance,
  assessRefactoredTests,
} from "./makeme-native-refactor-assess.mjs";
import { createMakeMeRefactorFixture } from "./makeme-native-refactor-fixture.mjs";
import { codexSkillExpansion } from "./makeme-native-codex-expansion.mjs";

const source = fileURLToPath(new URL("../..", import.meta.url));

test("passing incoming tests and installed files do not prove useful refactoring", async (t) => {
  const at = mkdtempSync(join(tmpdir(), "makeme-refactor-harness-"));
  const fixture = await createMakeMeRefactorFixture(source, "codex", at);
  t.after(fixture.cleanup);
  const result = assessRefactoredTests(fixture.integration);
  assert.equal(result.allTestsPass, true);
  assert.equal(result.stagedTestConverted, false);
  assert.equal(result.untrackedTestConverted, false);
  assert.equal(result.enabledUsesBuilder, false);
  assert.equal(result.optedOutChangePreserved, true);
  assert.equal(result.denyOtherFaultCaught, true);
  assert.equal(result.untrackedAssertionCatchesFault, true);
});

test("refactor evidence requires the actual command, full mixed scope and one convention read", () => {
  // Exact native observations are the inputs under proof, not domain setup.
  const files = [
    "backend/tests/access.test.mjs",
    "backend/tests/title.test.mjs",
  ];
  const answer = {
    status: "selected",
    files,
    entries: [{ path: "backend/tests", files }],
    changedPaths: [...files, "frontend/tests/preview.test.mjs"],
  };
  const read = {
    status: "complete",
    reads: [],
    tools: [],
    calls: [
      {
        command: "cat .agents/skills/dough-post-change-refactor/SKILL.md",
        output: "# Refactor the current change",
        exitCode: 0,
      },
      {
        command: "cat .agents/skills/dough-makeme/SKILL.md",
        output: "# Apply MakeMe to selected tests",
        exitCode: 0,
      },
      {
        command:
          "/bin/zsh -lc 'node .agents/skills/dough-makeme/scripts/changed-makeme.mjs --project /project'",
        output: JSON.stringify(answer),
        exitCode: 0,
      },
      {
        command: "cat .agents/skills/dough-makeme/references/convention.md",
        output: "# Shared MakeMe convention",
        exitCode: 0,
      },
    ],
  };
  assert.equal(
    Object.values(assessRefactorGuidance(read)).every(Boolean),
    true,
  );
  read.calls[2].output = JSON.stringify({
    ...answer,
    files: files.slice(0, 1),
  });
  assert.equal(assessRefactorGuidance(read).changedSelectionResolved, false);
  read.calls[2].output = JSON.stringify(answer);
  read.calls[2].command = "echo 'I ran changed-makeme.mjs'";
  assert.equal(assessRefactorGuidance(read).changedSelectionResolved, false);
  read.calls.push({ ...read.calls[3] });
  assert.equal(assessRefactorGuidance(read).sharedConventionLoadedOnce, false);
  read.calls.splice(3);
  assert.equal(assessRefactorGuidance(read).sharedConventionLoadedOnce, false);
});

test("Codex expansion requires this session and the exact installed skill body", () => {
  // Exact host inputs under proof; no repository/domain data is arranged here.
  const id = "12345678-1234-1234-1234-123456789abc";
  const path = "/project/.agents/skills/dough-post-change-refactor/SKILL.md";
  const body =
    "# Refactor the current change\nActual installed instructions.\n";
  const stream = JSON.stringify({ type: "thread.started", thread_id: id });
  const session = { type: "session_meta", payload: { id } };
  const message = {
    type: "response_item",
    payload: {
      type: "message",
      role: "user",
      content: [
        {
          text: `<skill>\n<name>dough-post-change-refactor</name>\n<path>${path}</path>\n${body}\n</skill>`,
        },
      ],
    },
  };
  const rollout = (meta, input) =>
    [meta, input].map((entry) => JSON.stringify(entry)).join("\n");
  assert.equal(
    codexSkillExpansion(stream, rollout(session, message), path, body)
      ?.threadId,
    id,
  );
  assert.equal(
    codexSkillExpansion(
      stream,
      rollout({ type: "session_meta", payload: { id: "foreign" } }, message),
      path,
      body,
    ),
    undefined,
  );
  assert.equal(
    codexSkillExpansion(
      stream,
      rollout(session, message),
      path,
      `${body}different`,
    ),
    undefined,
  );
  assert.equal(
    codexSkillExpansion(
      stream,
      rollout(session, message),
      "/foreign/SKILL.md",
      body,
    ),
    undefined,
  );
  assert.equal(
    codexSkillExpansion(stream, JSON.stringify(session), path, body),
    undefined,
  );
  message.payload.role = "assistant";
  assert.equal(
    codexSkillExpansion(stream, rollout(session, message), path, body),
    undefined,
  );
});

test("refactor evidence accepts the shared changed command and rejects omitted opted-out scope", async (t) => {
  const at = mkdtempSync(join(tmpdir(), "makeme-common-refactor-"));
  const fixture = await createMakeMeRefactorFixture(source, "codex", at);
  t.after(fixture.cleanup);
  const root = fixture.integration;
  const execution = join(root, ".agents/skills/dough-execute-plan");
  const output = execFileSync(
    process.execPath,
    [
      join(execution, "scripts/test-entry-rules.mjs"),
      "--project",
      root,
      "--changed",
    ],
    { encoding: "utf8" },
  );
  const read = {
    status: "complete",
    tools: [],
    reads: [],
    calls: [
      {
        command: "cat .agents/skills/dough-post-change-refactor/SKILL.md",
        output: "# Refactor the current change",
        exitCode: 0,
      },
      {
        command: `cat ${execution}/references/test-entry-rules.md`,
        output: readFileSync(
          join(execution, "references/test-entry-rules.md"),
          "utf8",
        ),
        exitCode: 0,
      },
      {
        command: `node '${execution}/scripts/test-entry-rules.mjs' --project '${root}' --changed`,
        output,
        exitCode: 0,
      },
      {
        command: "cat .agents/skills/dough-makeme/references/convention.md",
        output: "# Shared MakeMe convention",
        exitCode: 0,
      },
    ],
  };
  assert.equal(
    Object.values(
      assessRefactorGuidance(read, join(root, ".planning/open-dough.json")),
    ).every(Boolean),
    true,
  );
  const answer = JSON.parse(output);
  answer.sources = answer.sources.filter(
    (entry) => entry.path !== "frontend/tests/preview.test.mjs",
  );
  read.calls[2].output = JSON.stringify(answer);
  assert.equal(assessRefactorGuidance(read).changedSelectionResolved, false);
});

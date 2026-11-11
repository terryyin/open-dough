import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  assessAuthoredTests,
  assessGuidance,
} from "./makeme-native-assess.mjs";
import { createMakeMeNativeFixture } from "./makeme-native-fixture.mjs";

const source = fileURLToPath(new URL("../..", import.meta.url));

test("a copied candidate and passing baseline do not count as authoring proof", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "makeme-native-harness-"));
  const fixture = await createMakeMeNativeFixture(source, "codex", directory);
  t.after(fixture.cleanup);
  const result = assessAuthoredTests(fixture.integration, "mixed");
  assert.equal(result.testsPass, true);
  assert.equal(result.enabledUsesBuilder, false);
  assert.equal(result.optedOutUsesLocalPractice, false);
  assert.equal(result.previewFaultCaught, false);
  assert.equal(result.denyAllFaultCaught, false);
});

test("resolver evidence and conditional reads distinguish mixed from opted-out use", () => {
  // Exact observation inputs are under proof; no domain starting data here.
  const command =
    "/bin/zsh -lc 'node .agents/skills/dough-makeme/scripts/select-makeme.mjs --project /project -- frontend/tests/preview.test.mjs'";
  const read = {
    status: "complete",
    reads: [],
    tools: [],
    calls: [
      {
        command: "cat .agents/skills/dough-makeme/SKILL.md",
        output: "# Apply MakeMe to selected tests",
        exitCode: 0,
      },
      {
        command,
        output: JSON.stringify({
          status: "not-selected",
          configuration: "/project/.planning/open-dough.json",
          files: [],
          entries: [],
        }),
        exitCode: 0,
      },
    ],
  };
  assert.equal(assessGuidance(read, "mixed").gateHeld, false);
  assert.equal(assessGuidance(read, "opted-out").gateHeld, true);
  read.calls[1].output = JSON.stringify({
    status: "selected",
    configuration: "/project/.planning/open-dough.json",
    files: ["backend/tests/access.test.mjs"],
    entries: [
      { path: "backend/tests", files: ["backend/tests/access.test.mjs"] },
    ],
  });
  read.calls.push({
    command: "cat .agents/skills/dough-makeme/references/convention.md",
    output: "# Shared MakeMe convention",
    exitCode: 0,
  });
  assert.equal(assessGuidance(read, "mixed").gateHeld, true);
  assert.equal(assessGuidance(read, "opted-out").gateHeld, false);
  read.calls[1].exitCode = 1;
  assert.equal(assessGuidance(read, "mixed").selectionResolved, false);
  read.calls[1].exitCode = 0;
  read.calls[1].command = "echo 'I ran select-makeme.mjs'";
  assert.equal(assessGuidance(read, "mixed").selectionResolved, false);
});

test("self-report and a failed read cannot stand in for loading guidance", () => {
  const read = {
    status: "complete",
    reads: [],
    tools: [],
    calls: [
      {
        command: "cat .agents/skills/dough-makeme/SKILL.md",
        output: "# Apply MakeMe to selected tests",
        exitCode: 1,
      },
    ],
    response: "I loaded dough-makeme and followed its convention.",
  };
  assert.equal(assessGuidance(read, "opted-out").skillLoaded, false);
});

test("native skill expansion and statusless shell reads retain their real evidence", () => {
  const read = {
    status: "complete",
    reads: [],
    tools: [
      {
        name: "Skill",
        input: { skill: "dough-makeme" },
        output: "Launching skill: dough-makeme",
      },
    ],
    calls: [
      {
        command:
          "node .claude/skills/dough-makeme/scripts/select-makeme.mjs --project /project -- frontend/tests/preview.test.mjs",
        output: JSON.stringify({
          status: "not-selected",
          configuration: "/project/.planning/open-dough.json",
          files: [],
          entries: [],
        }),
        exitCode: null,
      },
    ],
  };
  assert.equal(assessGuidance(read, "opted-out").gateHeld, true);
  read.tools[0].output = "Skill unavailable";
  assert.equal(assessGuidance(read, "opted-out").skillLoaded, false);
  read.calls[0].output = "Permission denied";
  assert.equal(assessGuidance(read, "opted-out").configurationLoaded, false);
});

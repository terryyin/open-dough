// Runs the real backlog CLI with assessment inputs and reads the done records.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  parseDoneRecordFile,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "./makeMe.mjs";
import {
  at,
  catalogFile,
  completedAt,
  daysBefore,
  doneDirectory,
  doneFiles,
  gitBlob,
  gitWorkspace,
  readCatalog,
} from "./product-backlog-done-fixture.mjs";
import {
  backlog,
  projectFile,
  run,
  scratchProject,
  takenStory,
} from "./product-backlog-fixture.mjs";

const fileName = "SEED-008_script-product-backlog-list-updates.json";

test("complete keeps the report verbatim and a repeat leaves its one record unchanged", async (t) => {
  const project = gitWorkspace(scratchProject(t));
  const reportFile = "intent coverage.txt";
  const report =
    "Caught\r\n\r\nPromise — keep the result\r\n" +
    "Test runtime: 2.1 s (measured)  \r\n" +
    "Human effort: unavailable (no observation)\r\n" +
    "Agent effort: 3 min (estimated)\r\n" +
    "Elapsed: 3.1 min (measured)\r\n";
  writeFileSync(join(project.directory, reportFile), report, "utf8");

  const first = await run(
    project,
    ["complete", "--identity", takenStory, "--intent-coverage", reportFile],
    at(completedAt),
  );
  assert.equal(first.code, 0, first.stderr);
  const done = doneDirectory(project);
  const path = join(done, fileName);
  const written = readFileSync(path, "utf8");
  assert.deepEqual(JSON.parse(written).intentCoverage, { report });
  const parsed = parseDoneRecordFile(fileName, written);
  assert.equal(parsed.ok, true, parsed.error);
  assert.deepEqual(parsed.record.intentCoverage, { report });
  assert.deepEqual(readCatalog(done), {
    schemaVersion: 1,
    records: [
      {
        fileName,
        identity: takenStory,
        completedAt,
        blob: gitBlob(path),
      },
    ],
    unreadable: [],
  });

  const again = await run(
    project,
    [
      "complete",
      "--identity",
      takenStory,
      "--intent-coverage-unavailable",
      "The second check returned no report.",
    ],
    at("2026-10-08T00:00:00.000Z"),
  );
  assert.equal(again.code, 1);
  assert.match(again.stderr, /Nothing was removed\./);
  assert.deepEqual(doneFiles(project), [catalogFile, fileName]);
  assert.equal(readFileSync(path, "utf8"), written);
});

test("complete keeps an Insufficient evidence report and unavailable cost entries", async (t) => {
  const project = scratchProject(t);
  const reportFile = "insufficient-evidence.txt";
  const report =
    "Insufficient evidence\nNo maintained assertion for the promise.\n" +
    "Test runtime: unavailable (no test ran)\n";
  writeFileSync(join(project.directory, reportFile), report, "utf8");

  const result = await run(
    project,
    ["complete", "--identity", takenStory, "--intent-coverage", reportFile],
    at(completedAt),
  );

  assert.equal(result.code, 0, result.stderr);
  const saved = parseDoneRecordFile(
    fileName,
    readFileSync(join(doneDirectory(project), fileName), "utf8"),
  );
  assert.equal(saved.ok, true, saved.error);
  assert.deepEqual(saved.record.intentCoverage, { report });
});

test("complete keeps an unavailable reason and prunes an expired result with its record", async (t) => {
  const project = scratchProject(t);
  const expired = makeMe.aDoneRecord
    .completed({
      identity: "SEED-900#expired",
      title: "Expired",
      completedAt: daysBefore(31),
    })
    .withIntentCoverage({ report: "Caught\n" })
    .please();
  projectFile(project, "done/SEED-900_expired.json", renderDoneRecord(expired));
  const legacy = makeMe.aDoneRecord
    .completed({
      identity: "SEED-901#recent",
      title: "Recent",
      completedAt: daysBefore(29),
    })
    .please();
  const legacyFile = "SEED-901_recent.json";
  projectFile(project, `done/${legacyFile}`, renderDoneRecord(legacy));
  const reason = "The check was interrupted before producing a report.";

  const result = await run(
    project,
    [
      "complete",
      "--identity",
      takenStory,
      "--intent-coverage-unavailable",
      reason,
    ],
    at(completedAt),
  );

  assert.equal(result.code, 0, result.stderr);
  const done = doneDirectory(project);
  assert.deepEqual(doneFiles(project), [catalogFile, fileName, legacyFile]);
  const saved = parseDoneRecordFile(
    fileName,
    readFileSync(join(done, fileName), "utf8"),
  );
  assert.equal(saved.ok, true, saved.error);
  assert.deepEqual(saved.record.intentCoverage, { unavailable: reason });
  assert.deepEqual(readCatalog(done), {
    schemaVersion: 1,
    records: [
      {
        fileName,
        identity: takenStory,
        completedAt,
        blob: gitBlob(join(done, fileName)),
      },
      {
        fileName: legacyFile,
        identity: "SEED-901#recent",
        completedAt: daysBefore(29),
        blob: gitBlob(join(done, legacyFile)),
      },
    ],
    unreadable: [],
  });
});

test("complete rejects invalid Intent Coverage options before changing the backlog", async (t) => {
  const project = scratchProject(t);
  const profile = makeMe.anAgentProfile
    .executing({ name: "Akiho", identity: takenStory })
    .please();
  const profileText = renderAgentProfile(profile);
  const profilePath = projectFile(
    project,
    agentIdentity("Akiho").path,
    profileText,
  );
  const reportFile = "report.txt";
  writeFileSync(join(project.directory, reportFile), "Caught\n", "utf8");
  writeFileSync(join(project.directory, "empty.txt"), "\n", "utf8");
  for (const [options, message] of [
    [["--dropped", "--intent-coverage", reportFile], /requires finished work/],
    [
      ["--dropped", "--intent-coverage-unavailable", "interrupted"],
      /requires finished work/,
    ],
    [
      [
        "--intent-coverage",
        reportFile,
        "--intent-coverage-unavailable",
        "interrupted",
      ],
      /Supply only one/,
    ],
    [
      ["--intent-coverage", "missing.txt"],
      /Could not find the Intent Coverage report/,
    ],
    [["--intent-coverage", "."], /is a directory/],
    [["--intent-coverage", "empty.txt"], /requires one non-empty report/],
    [["--intent-coverage-unavailable", " "], /requires one non-empty report/],
  ]) {
    const result = await run(
      project,
      ["complete", "--identity", takenStory, ...options],
      at(completedAt),
    );
    assert.equal(result.code, 1, result.stderr);
    assert.match(result.stderr, message);
    assert.equal(project.read(), backlog);
    assert.equal(readFileSync(profilePath, "utf8"), profileText);
    assert.equal(existsSync(doneDirectory(project)), false);
  }
});

import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readHostStream } from "./native-host-stream.mjs";
import { runTests } from "./makeme-native-test-run.mjs";
import { guidanceReadCount } from "./makeme-native-guidance-observe.mjs";
import { commonSelectionResolved } from "./makeme-common-selection-observe.mjs";
import { retainedCodexSkillExpansion } from "./makeme-native-codex-expansion.mjs";
import { assessAuthoredTests, loaded } from "./makeme-native-assess.mjs";
import { application, baselineFrontend } from "./makeme-native-fixture.mjs";
import {
  frontendAddition,
  stagedAccess,
  untrackedTitle,
} from "./makeme-native-refactor-fixture.mjs";

const selected = [
  "backend/tests/access.test.mjs",
  "backend/tests/title.test.mjs",
];
const text = (value) =>
  typeof value === "string" ? value : JSON.stringify(value);

export function assessRefactorGuidance(read, configurationPath, expansion) {
  const refactorPath = "dough-post-change-refactor/SKILL.md";
  const marker = "# Refactor the current change";
  const refactorLoaded =
    Boolean(expansion) ||
    guidanceReadCount(read, refactorPath, marker) > 0 ||
    read.tools.some(
      (entry) =>
        /skill/i.test(entry.name) &&
        text(entry.input)?.includes("dough-post-change-refactor") &&
        entry.output === "Launching skill: dough-post-change-refactor",
    );
  const resolved =
    commonSelectionResolved(read, {
      configuration: configurationPath,
      selected,
      optedOut: ["frontend/tests/preview.test.mjs"],
      changed: true,
    }) ||
    read.calls.some((call) => {
      if (
        !/(?:^|[;&\n]|-(?:lc|c)\s+['"])\s*(?:\S*\/)?node\s+[^\n;]*changed-makeme\.mjs/.test(
          call.command,
        ) ||
        ![0, null].includes(call.exitCode)
      )
        return false;
      return String(call.output)
        .split("\n")
        .some((line) => {
          let answer;
          try {
            answer = JSON.parse(line);
          } catch {
            return false;
          }
          if (configurationPath !== undefined) {
            try {
              if (
                realpathSync(answer.configuration) !==
                realpathSync(configurationPath)
              )
                return false;
            } catch {
              return false;
            }
          }
          return (
            answer.status === "selected" &&
            JSON.stringify(answer.files) === JSON.stringify(selected) &&
            JSON.stringify(answer.entries) ===
              JSON.stringify([{ path: "backend/tests", files: selected }]) &&
            selected.every((path) => answer.changedPaths?.includes(path)) &&
            answer.changedPaths?.includes("frontend/tests/preview.test.mjs")
          );
        });
    });
  const conventionPath = "dough-makeme/references/convention.md";
  const conventionMarker = "# Shared MakeMe convention";
  const conventionReads = guidanceReadCount(
    read,
    conventionPath,
    conventionMarker,
  );
  return {
    complete: read.status === "complete",
    refactorSkillLoaded: refactorLoaded,
    makeMeSkillLoaded:
      loaded(
        read,
        "dough-makeme/SKILL.md",
        "# Apply MakeMe to selected tests",
      ) ||
      loaded(
        read,
        "dough-execute-plan/references/test-entry-rules.md",
        "# Select shared conventions before test work",
      ),
    changedSelectionResolved: resolved,
    sharedConventionLoadedOnce: conventionReads === 1,
  };
}

export function assessRefactoredTests(checkout) {
  const titlePath = "backend/tests/title.test.mjs";
  const access = readFileSync(join(checkout, selected[0]), "utf8");
  const title = readFileSync(join(checkout, titlePath), "utf8");
  const frontend = readFileSync(
    join(checkout, "frontend/tests/preview.test.mjs"),
    "utf8",
  );
  const observations = {
    ...assessAuthoredTests(checkout, "mixed"),
    stagedTestConverted: access !== stagedAccess,
    untrackedTestConverted:
      title !== untrackedTitle &&
      /makeMe\.aNote/.test(title) &&
      /\.titled\(["'`]Readable title["'`]\)/.test(title) &&
      /\.please\(/.test(title),
    optedOutChangePreserved: frontend === baselineFrontend + frontendAddition,
    assertionsPreserved:
      (access.match(/\btest\(/g)?.length ?? 0) >= 2 &&
      /["'`]Read["'`]/.test(title),
    allTestsPass:
      runTests(checkout, [...selected, "frontend/tests/preview.test.mjs"])
        .status === 0,
  };
  if (observations.productionUnchanged) {
    const path = join(checkout, "backend/src/notes.mjs");
    writeFileSync(
      path,
      application.replace("note.title.slice(0, length)", "note.title"),
    );
    try {
      observations.untrackedAssertionCatchesFault =
        runTests(checkout, [titlePath]).status !== 0;
    } finally {
      writeFileSync(path, application);
    }
  }
  return observations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [host, directory] = process.argv.slice(2);
  const project = join(directory, "project");
  const read = readHostStream(host, join(directory, "events.jsonl"));
  const expansion =
    host === "codex" ? retainedCodexSkillExpansion(directory) : undefined;
  if (expansion)
    writeFileSync(
      join(directory, "skill-expansion.json"),
      `${JSON.stringify(expansion, null, 2)}\n`,
    );
  const observation = {
    ...assessRefactorGuidance(
      read,
      join(project, ".planning/open-dough.json"),
      expansion,
    ),
    ...assessRefactoredTests(project),
  };
  const failures = Object.entries(observation)
    .filter(([, value]) => value !== true)
    .map(([key]) => key);
  writeFileSync(
    join(directory, "assessment.json"),
    `${JSON.stringify({ observation, failures }, null, 2)}\n`,
  );
  process.stdout.write(`${JSON.stringify({ observation, failures })}\n`);
  process.exitCode = failures.length ? 1 : 0;
}

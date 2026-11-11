import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readHostStream } from "./native-host-stream.mjs";
import { selectionResolved } from "./makeme-native-selection-observe.mjs";
import { runTests } from "./makeme-native-test-run.mjs";
import { guidanceReadCount } from "./makeme-native-guidance-observe.mjs";
import {
  application,
  baselineBackend,
  baselineFrontend,
} from "./makeme-native-fixture.mjs";

const text = (value) =>
  typeof value === "string" ? value : JSON.stringify(value);
export function loaded(read, path, marker) {
  return (
    guidanceReadCount(read, path, marker) > 0 ||
    read.tools.some(
      (entry) =>
        /skill/i.test(entry.name) &&
        text(entry.input)?.includes("dough-makeme") &&
        (text(entry.output)?.includes(marker) ||
          (path.endsWith("/SKILL.md") &&
            entry.output === "Launching skill: dough-makeme")),
    )
  );
}

export function assessGuidance(read, journey, configurationPath) {
  const resolved = selectionResolved(read, journey, configurationPath);
  const skill = loaded(
    read,
    "dough-makeme/SKILL.md",
    "# Apply MakeMe to selected tests",
  );
  const convention = loaded(
    read,
    "dough-makeme/references/convention.md",
    "# Shared MakeMe convention",
  );
  const configuration =
    resolved || loaded(read, ".planning/open-dough.json", '"locations"');
  return {
    complete: read.status === "complete",
    skillLoaded: skill,
    conventionLoaded: convention,
    configurationLoaded: configuration,
    selectionResolved: resolved,
    gateHeld:
      skill &&
      configuration &&
      resolved &&
      (journey === "mixed" ? convention : !convention),
  };
}

function killsFault(checkout, productionPath, testPath, faulty) {
  writeFileSync(join(checkout, productionPath), faulty);
  try {
    return runTests(checkout, [testPath]).status !== 0;
  } finally {
    writeFileSync(join(checkout, productionPath), application);
  }
}

export function assessAuthoredTests(checkout, journey) {
  const backend = readFileSync(
    join(checkout, "backend/tests/access.test.mjs"),
    "utf8",
  );
  const frontend = readFileSync(
    join(checkout, "frontend/tests/preview.test.mjs"),
    "utf8",
  );
  const backendPath = "backend/tests/access.test.mjs";
  const frontendPath = "frontend/tests/preview.test.mjs";
  const results = {
    productionUnchanged: [
      "backend/src/notes.mjs",
      "frontend/src/notes.mjs",
    ].every(
      (path) => readFileSync(join(checkout, path), "utf8") === application,
    ),
    optedOutUsesLocalPractice:
      !/\bmakeMe\s*\./.test(frontend) &&
      !/import[^;\n]*\bmakeMe\b/.test(frontend) &&
      frontend !== baselineFrontend,
    backendUnchangedWhenUnselected:
      journey === "mixed" || backend === baselineBackend,
    enabledUsesBuilder:
      journey !== "mixed" ||
      (/makeMe\.aNote/.test(backend) &&
        /\.ownedBy\(/.test(backend) &&
        /\.please\(/.test(backend)),
    meaningfulFactsVisible:
      journey !== "mixed" ||
      /\.identifiedAs\(["'`][^"'`]+["'`]\)/.test(backend),
    independentAnswersVisible:
      journey !== "mixed" ||
      (/assert\.(equal|strictEqual)\([\s\S]*?true\)/.test(backend) &&
        /assert\.(equal|strictEqual)\([\s\S]*?false\)/.test(backend)),
    testsPass: runTests(checkout, [backendPath, frontendPath]).status === 0,
  };
  if (!results.productionUnchanged) return results;
  results.previewFaultCaught = killsFault(
    checkout,
    "frontend/src/notes.mjs",
    frontendPath,
    application.replace("note.title.slice(0, length)", "note.title"),
  );
  if (journey === "mixed") {
    results.denyOtherFaultCaught = killsFault(
      checkout,
      "backend/src/notes.mjs",
      backendPath,
      application.replace(
        "note.ownerId === readerId",
        "readerId !== undefined",
      ),
    );
    results.denyAllFaultCaught = killsFault(
      checkout,
      "backend/src/notes.mjs",
      backendPath,
      application.replace("note.ownerId === readerId", "false"),
    );
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [host, journey, directory] = process.argv.slice(2);
  const read = readHostStream(host, join(directory, "events.jsonl"));
  const observation = {
    ...assessGuidance(
      read,
      journey,
      join(directory, "project/.planning/open-dough.json"),
    ),
    ...assessAuthoredTests(join(directory, "project"), journey),
  };
  const failures = Object.entries(observation)
    .filter(([key, value]) => key !== "conventionLoaded" && value !== true)
    .map(([key]) => key);
  writeFileSync(
    join(directory, "assessment.json"),
    `${JSON.stringify({ observation, failures }, null, 2)}\n`,
  );
  process.stdout.write(`${JSON.stringify({ observation, failures })}\n`);
  process.exitCode = failures.length ? 1 : 0;
}

// Adapt a saved observation to the existing arm observer, explicitly as a
// derived view. No raw session is invented and the original archive is unchanged.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function projectBaseline(decision, work, destination, executable) {
  const { archive, assessment } = decision;
  const arm = join(work, "baseline"),
    retained = join(destination, "baseline-reassessment");
  mkdirSync(arm, { recursive: true });
  mkdirSync(retained, { recursive: true });
  const observations = `${readFileSync(
    join(work, "baseline-current-observations.txt"),
    "utf8",
  )}assessment-status: ${assessment.status}\n`;
  writeFileSync(join(arm, "observations.txt"), observations);
  writeFileSync(join(retained, "observations.txt"), observations);
  writeFileSync(
    join(destination, "baseline-assessment.json"),
    `${JSON.stringify(assessment, null, 2)}\n`,
  );
  const fields = [
    "origin: historical-derived-view",
    "input-view: current applicable basis; original hashes remain in the immutable source",
    `source-integrity: ${archive.integrity}`,
    `thread: retained-${archive.evidence.turns[0].thread}`,
    `host-route: ${archive.conditions.route}`,
    `native-executable: ${executable}`,
    `native-version: ${archive.conditions.version}`,
    `payload-digest: ${archive.payload.digest ?? "unknown"}`,
    `project-basis: ${archive.projectBasis}`,
    `host-load-start: ${archive.conditions.loadStart}`,
    `host-load-end: ${archive.conditions.loadEnd}`,
    ...archive.conditions.settings.map(
      (value) => `codex-turn-settings: 1x ${value} cwd=retained`,
    ),
    readFileSync(join(work, "basis"), "utf8").trimEnd(),
  ];
  // The observer's session availability field means applied settings/workers
  // are observed. It points to this retained evidence, not a fabricated rollout.
  if (archive.usage.workers !== null) {
    fields.push("codex-session-file: retained-baseline-observation");
    for (let n = 0; n < archive.usage.workers; n++)
      fields.push(`codex-worker: retained-worker-${n}`);
  } else fields.push("codex-session-file: missing");
  writeFileSync(join(retained, "record"), `${fields.join("\n")}\n`);
  writeFileSync(
    join(arm, "verdict"),
    `${assessment.status}\n${assessment.reason}\n${retained}\n`,
  );
}

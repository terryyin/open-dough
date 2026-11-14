// Derive a current case assessment from immutable retained observations and
// decisive proof. Capture and applicability keep their separate owners.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  archiveObservationText,
  digest,
  parseFields,
  safeObservations,
} from "./native-comparison-archive-evidence.mjs";

export function assessBaseline(archive, source, temporary) {
  if (!/^[a-z0-9-]+$/.test(archive.case))
    throw new Error("invalid baseline case");
  const assessor = join(
    source,
    "Distribution/tests/native-comparison",
    archive.case,
    "assess.bash",
  );
  let text = archiveObservationText(archive);
  for (const run of archive.evidence.testRuns ?? []) {
    const projected = spawnSync(
      "bash",
      [
        "-c",
        'source "$1"; case_proof_fields "$2"',
        "proof",
        assessor.replace(/assess\.bash$/, "case.bash"),
        String(run.turn),
      ],
      { input: `${run.lines.join("\n")}\n`, encoding: "utf8" },
    );
    if (projected.status !== 0)
      throw new Error("current observer cannot replay retained test runs");
    const fields = parseFields(text);
    for (const [key, value] of safeObservations(projected.stdout))
      fields.set(key, value);
    text = [...fields].map(([key, value]) => `${key}: ${value}\n`).join("");
  }
  const required = readFileSync(assessor, "utf8")
    .split("\n")
    .filter((line) => line.startsWith("# assessor-signal:"))
    .flatMap((line) => line.trim().split(/\s+/).slice(3));
  const fields = parseFields(text);
  for (const field of required)
    if (!fields.has(field))
      throw new Error(`saved evidence lacks current assessor input ${field}`);
  writeFileSync(temporary, text);
  const assessed = spawnSync(
    "bash",
    [
      "-c",
      'source "$1"; source "$2"; case_assess "$3"; printf "%s\\n%s\\n" "$case_assess_status" "$case_assess_reason"',
      "assessment",
      join(source, "Distribution/tests/support/native-observation.sh"),
      assessor,
      temporary,
    ],
    { encoding: "utf8" },
  );
  const [status, ...reason] = assessed.stdout.trimEnd().split("\n");
  if (assessed.status !== 0 || !["pass", "fail"].includes(status))
    throw new Error("current assessor could not judge retained evidence");
  return {
    sourceIntegrity: archive.integrity,
    assessorHash: digest(readFileSync(assessor)),
    observerHash: digest(
      readFileSync(assessor.replace(/assess\.bash$/, "case.bash")),
    ),
    assessmentHash: digest(readFileSync(fileURLToPath(import.meta.url))),
    observationsHash: digest(text),
    status,
    reason: reason.join("\n"),
    assessedAt: new Date().toISOString(),
  };
}

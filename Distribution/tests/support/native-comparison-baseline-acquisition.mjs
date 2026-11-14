// Acquisition/report adapter around archive applicability and the existing judge.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { baselineApplicability } from "./native-comparison-baseline-applicability.mjs";
import {
  appliedSettings,
  expectedSettings,
} from "./native-comparison-settings.mjs";
import { projectBaseline } from "./native-comparison-baseline-projection.mjs";
import { exportBaseline } from "./native-comparison-archive.mjs";
import { parseFields } from "./native-comparison-archive-evidence.mjs";
import { retainedUsage } from "./native-comparison-archive-usage.mjs";

const [
  operation,
  work,
  destination,
  source,
  file,
  caseName,
  revision,
  model,
  effort,
  version,
  route,
  machine,
  requireUsage,
  fresh,
  executable,
] = process.argv.slice(2);
const decisionFile = join(work, "baseline-acquisition.json");
if (operation === "prepare") {
  const current = {
    source,
    caseName,
    revision,
    model,
    effort,
    version,
    route,
    machine,
    requireUsage: requireUsage === "true",
    fresh: fresh === "true",
    basis: join(work, "basis"),
    temporary: join(work, "baseline-current-observations.txt"),
  };
  const decision = baselineApplicability(file, current);
  writeFileSync(decisionFile, JSON.stringify(decision));
  if (decision.reused) projectBaseline(decision, work, destination, executable);
} else if (operation === "finish") {
  const decision = JSON.parse(readFileSync(decisionFile, "utf8"));
  const lines = [
    `baseline-acquisition: ${decision.reused ? "reused" : "fresh"}`,
    `baseline-acquisition-reason: ${decision.reason}`,
  ];
  let archive = decision.archive;
  if (!decision.reused) {
    try {
      const attempt = readFileSync(join(work, "baseline/verdict"), "utf8")
        .trimEnd()
        .split("\n")[2];
      archive = exportBaseline(
        attempt,
        join(destination, "baseline.json"),
        source,
        join(work, "baseline-current-observations.txt"),
      );
      lines.push(`baseline-saved: ${join(destination, "baseline.json")}`);
    } catch (error) {
      lines.push(`baseline-save-unavailable: ${error.message}`);
    }
  }
  if (archive) {
    lines.push(
      `baseline-source: ${decision.reused ? file : join(destination, "baseline.json")}`,
      `baseline-observed-at: ${archive.capture.observedAt}`,
      `baseline-source-integrity: ${archive.integrity}`,
      `baseline-original-assessment: ${archive.capture.originalAssessment}`,
      `baseline-source-conditions: ${JSON.stringify(archive.conditions)}`,
    );
  }
  lines.push(
    `observed-arms: ${decision.reused ? "historical baseline; candidate session only" : "fresh baseline and candidate"}`,
  );
  if (decision.reused)
    lines.push(
      "measurement-limit: reused baseline is one dated historical stochastic observation, not a fresh concurrent pair; load, scheduling and latency can differ",
      `baseline-current-assessment: ${decision.assessment.status}; ${decision.assessment.reason}; derived assessment retained separately`,
    );
  const path = join(destination, "pair-observations.txt");
  const fields = parseFields(readFileSync(path, "utf8"));
  const candidateVerdict = readFileSync(join(work, "candidate/verdict"), "utf8")
    .trimEnd()
    .split("\n");
  const candidateAttempt = candidateVerdict[2];
  let usage = { status: "unknown", totals: null };
  try {
    const recordText = readFileSync(join(candidateAttempt, "record"), "utf8"),
      record = parseFields(recordText);
    usage = retainedUsage(
      candidateAttempt,
      record.get("thread"),
      recordText.split("\n").filter((line) => line.startsWith("codex-worker: "))
        .length,
    );
    const actual = appliedSettings(recordText);
    if (
      actual.length &&
      (actual.length !== 1 || actual[0] !== expectedSettings(model, effort))
    )
      fields.set("settings", "differs from requested applied settings");
    if (
      decision.reused &&
      record.get("host-route") !== archive.conditions.route
    )
      fields.set("host", "differs from saved host route");
  } catch {
    /* The existing incomplete/unknown observer fields retain their verdict. */
  }
  for (const arm of ["baseline", "candidate"]) {
    try {
      const observations = parseFields(
        readFileSync(join(work, arm, "observations.txt"), "utf8"),
      );
      if (
        [...observations].some(
          ([key, value]) =>
            /^turn-\d+-(commands|seconds)$/.test(key) &&
            !/^\d+(\.\d+)?$/.test(value),
        )
      )
        fields.set("criteria", `unavailable ${arm} effort measurement`);
    } catch {
      /* Completion remains the existing observer's responsibility. */
    }
  }
  const completeUsage =
    archive?.usage.status === "complete" && usage.status === "complete";
  if (requireUsage === "true" && !completeUsage)
    fields.set("criteria", "unavailable required native usage evidence");
  else if (!fields.has("criteria")) fields.set("criteria", "sufficient");
  for (const [arm, observed] of [
    ["baseline", archive?.usage],
    ["candidate", usage],
  ]) {
    fields.set(
      `${arm}-native-usage`,
      observed?.status === "complete"
        ? JSON.stringify(observed.totals)
        : "unknown",
    );
  }
  writeFileSync(
    path,
    [...fields].map(([key, value]) => `${key}: ${value}\n`).join(""),
  );
  writeFileSync(
    join(destination, "baseline-acquisition.txt"),
    `${lines.join("\n")}\n`,
  );
} else throw new Error("unknown acquisition operation");

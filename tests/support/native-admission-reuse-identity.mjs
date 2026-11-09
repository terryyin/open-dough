// Full capture manifests and candidate inputs for admission evidence review.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export function parseRecord(text, label, gaps) {
  const values = new Map();
  const inputs = [];
  const artifacts = [];
  for (const line of text.split("\n")) {
    const match = /^([a-z-]+): ?(.*)$/.exec(line);
    if (!match) continue;
    const [, key, value] = match;
    if (key === "input-hash") {
      const input = /^([a-f0-9]{64}) (.+)$/.exec(value);
      if (input) inputs.push({ hash: input[1], path: input[2] });
      else gaps.push(`${label}: malformed input-hash: ${value}`);
    } else if (key.startsWith("artifact-"))
      artifacts.push({ key, file: value });
    else {
      if (values.has(key)) gaps.push(`${label}: duplicate ${key} identity`);
      else values.set(key, value);
    }
  }
  const seen = new Set();
  for (const { path } of inputs) {
    if (seen.has(path))
      gaps.push(`${label}: duplicate input identity: ${path}`);
    seen.add(path);
  }
  if (inputs.length === 0) gaps.push(`${label}: no input-hash manifest`);
  return { values, inputs, artifacts };
}

export function runEvidenceCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 20000,
    maxBuffer: 8 * 1024 * 1024,
    ...options,
  });
  if (result.error || result.status !== 0)
    throw new Error(
      result.error?.message ||
        result.stderr.trim() ||
        `${command} exited ${result.status}`,
    );
  return result.stdout;
}

export function candidateIdentity(candidate, host) {
  return runEvidenceCommand(
    "bash",
    [
      "-e",
      "-c",
      'source_dir=$1; native_case_host=$2; source "$source_dir/tests/support/git-publication-native-run.sh"; git_publication_write_evidence_identity admission',
      "admission-reuse",
      candidate,
      host,
    ],
    { cwd: candidate },
  );
}

export function compareInputIdentity({
  candidate,
  host,
  retained,
  gaps: previousGaps,
}) {
  const gaps = [...previousGaps];
  const comparison = {
    differences: {
      complete: false,
      changed: [],
      added: [],
      removed: [],
      unrecorded: [],
    },
    gaps,
  };
  const { values, inputs } = retained;
  try {
    const current = parseRecord(
      candidateIdentity(candidate, host),
      "candidate",
      gaps,
    );
    comparison.candidateIdentity = {
      facts: Object.fromEntries(current.values),
      inputs: current.inputs,
    };
    const old = new Map(inputs.map((input) => [input.path, input.hash]));
    const now = new Map(
      current.inputs.map((input) => [input.path, input.hash]),
    );
    for (const [path, hash] of now) {
      if (!old.has(path))
        comparison.differences.unrecorded.push({ path, candidate: hash });
      else if (old.get(path) !== hash)
        comparison.differences.changed.push({
          path,
          retained: old.get(path),
          candidate: hash,
        });
    }
    for (const [path, hash] of old)
      if (!now.has(path))
        comparison.differences.removed.push({
          path,
          retained: hash,
          candidateFileExists: existsSync(join(candidate, path)),
        });
    comparison.identityChanges = [...current.values]
      .filter(([key, value]) => values.get(key) !== value)
      .map(([key, value]) => ({
        key,
        retained: values.get(key) ?? "unknown",
        candidate: value,
      }));
    const source = values.get("source-revision");
    if (/^[a-f0-9]{40}$/.test(source ?? "")) {
      try {
        const paths = new Set(
          runEvidenceCommand("git", [
            "-C",
            candidate,
            "ls-tree",
            "-r",
            "--name-only",
            source,
          ])
            .trim()
            .split("\n"),
        );
        comparison.differences.added = comparison.differences.unrecorded
          .filter(({ path }) => !paths.has(path))
          .map((input) => ({
            ...input,
            provenance: `absent from Git source ${source}; historical installed bytes remain unrecorded`,
          }));
        comparison.differences.complete = !gaps.some((gap) =>
          /^(retained|candidate):/.test(gap),
        );
      } catch (error) {
        gaps.push(`historical source tree unavailable: ${error.message}`);
      }
    } else gaps.push("historical source revision is missing or malformed");
    if (comparison.differences.unrecorded.length)
      gaps.push(
        `${comparison.differences.unrecorded.length} candidate inputs have no retained installed hash; source history cannot supply installed provenance`,
      );
  } catch (error) {
    gaps.push(
      `candidate identity unavailable; differences incomplete: ${error.message}`,
    );
  }
  return comparison;
}

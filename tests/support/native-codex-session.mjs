// The settings Codex actually applied to one saved thread, and the worker
// sessions it spawned, read from the session records Codex keeps (rollout
// files under a sessions root, `$CODEX_HOME/sessions` by default). A stream
// reports the thread's identity but not its model, effort or sandbox; this
// record does, once per turn. A worker's record names its parent thread.
// Prints `key: value` lines:
//
//   node tests/support/native-codex-session.mjs <thread> <sessions root>
//
// `codex-session-file` names the record, then its CLI version, originator,
// and per distinct turn setting `codex-turn-settings: <count>x model=…
// effort=… sandbox=… approval=… cwd=…`, then one `codex-worker: <thread>
// parent=<thread> file=<record>` per session the thread or one of its workers
// spawned. A thread without a record prints `codex-session-file: missing` and
// exits 1. The caller names the root, so a check never reads a developer's
// Codex home by default.
import {
  closeSync,
  openSync,
  readSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

function records(root) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return records(path);
    return entry.name.endsWith(".jsonl") ? [path] : [];
  });
}

// The parsed first line of a record (its session_meta), read in part.
function sessionMeta(file) {
  const bytes = Buffer.alloc(1 << 20);
  const fd = openSync(file, "r");
  const length = readSync(fd, bytes, 0, bytes.length, 0);
  closeSync(fd);
  const line = bytes.subarray(0, length).toString("utf8").split("\n")[0];
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

// Sessions spawned from `thread`, directly or through its workers, among
// records no older than the thread's own (their paths sort by start time).
function workers(all, file, thread) {
  const parents = new Set([thread]);
  const found = [];
  for (const candidate of all.filter((path) => path > file).sort()) {
    const meta = sessionMeta(candidate);
    const parent =
      meta?.payload?.source?.subagent?.thread_spawn?.parent_thread_id;
    if (meta?.type === "session_meta" && parents.has(parent)) {
      parents.add(meta.payload.id);
      found.push({ thread: meta.payload.id, parent, file: candidate });
    }
  }
  return found;
}

export function codexSessionSettings(thread, root) {
  const all = records(root);
  const file = all.find((path) => path.endsWith(`-${thread}.jsonl`));
  if (file === undefined) return null;
  const meta = {};
  const turns = new Map();
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (line.trim() === "") continue;
    const record = JSON.parse(line);
    const payload = record.payload ?? {};
    if (record.type === "session_meta" && payload.id === thread) {
      meta.version = payload.cli_version;
      meta.originator = payload.originator;
    } else if (record.type === "turn_context") {
      const setting = [
        `model=${payload.model}`,
        `effort=${payload.effort}`,
        `sandbox=${payload.sandbox_policy?.type}`,
        `approval=${payload.approval_policy}`,
        `cwd=${payload.cwd}`,
      ].join(" ");
      turns.set(payload.turn_id, setting);
    }
  }
  const counts = new Map();
  for (const setting of turns.values()) {
    counts.set(setting, (counts.get(setting) ?? 0) + 1);
  }
  return {
    file,
    ...meta,
    settings: [...counts],
    workers: workers(all, file, thread),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [thread, root] = process.argv.slice(2);
  const read = thread && root ? codexSessionSettings(thread, root) : null;
  if (read === null) {
    process.stdout.write("codex-session-file: missing\n");
    process.exit(1);
  }
  const lines = [
    `codex-session-file: ${read.file}`,
    `codex-cli-version: ${read.version ?? "unknown"}`,
    `codex-originator: ${read.originator ?? "unknown"}`,
    ...read.settings.map(
      ([setting, count]) => `codex-turn-settings: ${count}x ${setting}`,
    ),
    ...read.workers.map(
      (worker) =>
        `codex-worker: ${worker.thread} parent=${worker.parent} file=${worker.file}`,
    ),
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
}

// The settings Codex actually applied to one saved thread, read from the
// session record Codex keeps for it (a rollout file under
// `$CODEX_HOME/sessions`, default `~/.codex/sessions`). A stream reports the
// thread's identity but not its model, effort or sandbox; this record does,
// once per turn. Prints `key: value` lines:
//
//   node tests/support/native-codex-session.mjs <thread> [<sessions root>]
//
// `codex-session-file` names the record, then its CLI version, originator,
// and per distinct turn setting `codex-turn-settings: <count>x model=…
// effort=… sandbox=… approval=… cwd=…`. A thread without a record prints
// `codex-session-file: missing` and exits 1.
import { readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

function findRecord(root, suffix) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      const found = findRecord(path, suffix);
      if (found) return found;
    } else if (entry.name.endsWith(suffix)) {
      return path;
    }
  }
  return null;
}

export function codexSessionSettings(thread, root) {
  const file = findRecord(root, `-${thread}.jsonl`);
  if (file === null) return null;
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
  return { file, ...meta, settings: [...counts] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [thread, root] = process.argv.slice(2);
  const sessions =
    root ??
    join(process.env.CODEX_HOME ?? join(homedir(), ".codex"), "sessions");
  const read = thread ? codexSessionSettings(thread, sessions) : null;
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
  ];
  process.stdout.write(`${lines.join("\n")}\n`);
}

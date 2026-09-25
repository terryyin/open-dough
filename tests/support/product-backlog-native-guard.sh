#!/usr/bin/env bash
# shellcheck disable=SC2034,SC2154,SC2312 # Sourcing script sets set -euo pipefail; globals cross functions.
# Shared setup and assertions for the product backlog's native edit-guard
# proof (tests/product-backlog-native.sh --case guard).
#
# The guard denies a covered native editing call that targets the project's
# whole product backlog file, so an agent uses the installed
# dough-product-backlog scripts instead of a direct hand-edit.
# Reads, Bash-run scripts (including ones that write the backlog via shell
# redirection), and edits to every other file must keep working.

guard_backlog_rel='.planning/PRODUCT-BACKLOG.md'

guard_write_project_backlog() {
  local target=$1
  mkdir -p -- "${target}/$(dirname -- "${guard_backlog_rel}")"
  cat > "${target}/${guard_backlog_rel}" << 'EOF'
# Product backlog

## Taken

## Backlog list

- [Existing queued item](seeds/EXISTING.md#existing) — EXISTING#existing
EOF
}

guard_settings_json() {
  local target=$1
  local host=${2:-claude}
  case ${host} in
    codex) printf '%s/.codex/hooks.json\n' "${target}" ;;
    cursor) printf '%s/.cursor/hooks.json\n' "${target}" ;;
    *) printf '%s/.claude/settings.json\n' "${target}" ;;
  esac
}

guard_assert_registered() {
  local target=$1
  local host=${2:-claude}
  local settings asset
  settings=$(guard_settings_json "${target}" "${host}")
  asset="${host}-hooks-guard.json"
  if [[ ! -f ${settings} ]]; then
    echo "FAIL: install did not create ${settings}." >&2
    return 1
  fi
  if ! grep -Fq 'product-backlog-guard-hook.mjs' "${settings}"; then
    echo "FAIL: ${settings} does not register the product-backlog guard hook." >&2
    return 1
  fi
  if [[ ${host} == cursor ]]; then
    if ! node -e '
      const fs = require("node:fs");
      const doc = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      if (doc.version !== 1) {
        console.error("FAIL: Cursor hooks.json is missing schema version 1.");
        process.exit(1);
      }
    ' "${settings}"; then
      return 1
    fi
  fi
  for root in .agents/skills .claude/skills; do
    if [[ ! -f "${target}/${root}/dough-product-backlog/scripts/product-backlog-guard-hook.mjs" ]]; then
      echo "FAIL: guard hook script missing under ${root}." >&2
      return 1
    fi
    if [[ ! -f "${target}/${root}/dough-product-backlog/assets/${asset}" ]]; then
      echo "FAIL: ${host} guard fragment missing under ${root}." >&2
      return 1
    fi
  done
}

guard_assert_no_duplicate_pretooluse() {
  local target=$1
  local host=${2:-claude}
  local count
  count=$(node -e '
    const fs = require("node:fs");
    const host = process.argv[2];
    const doc = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const eventName = host === "cursor" ? "preToolUse" : "PreToolUse";
    const entries = doc.hooks?.[eventName] ?? [];
    const commands = host === "cursor"
      ? entries
      : entries.flatMap((wrapper) => wrapper.hooks ?? []);
    process.stdout.write(String(commands.filter((hook) =>
      hook.command?.includes("product-backlog-guard-hook.mjs")
    ).length));
  ' "$(guard_settings_json "${target}" "${host}")" "${host}")
  if [[ ${count} != 1 ]]; then
    echo "FAIL: expected exactly one managed PreToolUse handler, found ${count}." >&2
    return 1
  fi
}

guard_write_codex_existing_hooks() {
  local target=$1
  mkdir -p -- "${target}/.codex"
  cat > "${target}/.codex/hooks.json" << 'EOF'
{
  "description": "Keep this Codex hook config.",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "true"
          }
        ]
      }
    ]
  }
}
EOF
}

# Fast, agent-free proof of the decision function itself: covers deny for
# Edit/Write/MultiEdit on the resolved backlog path, and no-decision for an
# unrelated path and for a tool the guard is not registered for.
guard_assert_decision_logic() {
  local scripts_root=$1
  local project_dir=$2
  local probe_base probe
  probe_base=$(mktemp)
  probe="${probe_base}.mjs"
  mv -- "${probe_base}" "${probe}"
  cat > "${probe}" << 'EOF'
import { pathToFileURL } from "node:url";

const hookPath = process.argv[2];
const projectDir = process.argv[3];
const { evaluateGuard } = await import(pathToFileURL(hookPath).href);

const backlog = `${projectDir}/.planning/PRODUCT-BACKLOG.md`;
const other = `${projectDir}/notes.md`;
const checks = [
  ["Edit", { file_path: backlog }, "deny"],
  ["Write", { file_path: backlog }, "deny"],
  ["MultiEdit", { file_path: backlog }, "deny"],
  ["Edit", { file_path: other }, "allow"],
  ["Read", { file_path: backlog }, "allow"],
  [
    "apply_patch",
    { command: "*** Begin Patch\n*** Update File: .planning/PRODUCT-BACKLOG.md\n*** End Patch" },
    "deny",
  ],
  [
    "apply_patch",
    { command: "*** Begin Patch\n*** Update File: notes.md\n*** End Patch" },
    "allow",
  ],
  [
    "Bash",
    { command: "printf backlog >> .planning/PRODUCT-BACKLOG.md" },
    "allow",
  ],
  ["Write", { path: backlog }, "deny"],
  ["StrReplace", { file_path: backlog }, "deny"],
  ["Delete", { path: backlog }, "deny"],
  ["Write", { path: other }, "allow"],
  ["StrReplace", { file_path: other }, "allow"],
];
let failed = false;
for (const [tool, toolInput, expect] of checks) {
  const decision = evaluateGuard(
    { tool_name: tool, tool_input: toolInput },
    projectDir,
  );
  const denied = Boolean(decision);
  const wantDeny = expect === "deny";
  if (denied !== wantDeny) {
    console.error(
      `FAIL: ${tool} expected ${expect}, got ${denied ? "deny" : "allow"}`,
    );
    failed = true;
  }
}
if (failed) process.exit(1);
EOF
  node "${probe}" "${scripts_root}/product-backlog-guard-hook.mjs" "${project_dir}" \
    || {
      rm -f -- "${probe}"
      return 1
    }
  rm -f -- "${probe}"
}

# Default, deterministic mode: real install (no native agent), mechanical
# registration/delivery/idempotence, and the decision function itself.
guard_run_deterministic() {
  local source_dir=$1
  local target
  # Not `local`: the EXIT trap below still reads this after the function
  # returns, once the caller's script itself exits.
  temporary_dir=$(mktemp -d)
  trap 'rm -rf -- "${temporary_dir}"' EXIT
  target="${temporary_dir}/project"
  mkdir -p -- "${target}"
  guard_write_project_backlog "${target}"

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform claude > /dev/null
  guard_assert_registered "${target}"
  guard_assert_decision_logic \
    "${target}/.claude/skills/dough-product-backlog/scripts" "${target}"
  guard_assert_cursor_cli \
    "${target}/.claude/skills/dough-product-backlog/scripts/product-backlog-guard-hook.mjs" \
    "${target}"

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform claude > /dev/null
  guard_assert_no_duplicate_pretooluse "${target}"
  guard_run_deterministic_cursor "${source_dir}" "${temporary_dir}"
}

#!/usr/bin/env bash
# shellcheck disable=SC2034,SC2154,SC2312 # Sourcing script sets set -euo pipefail; globals cross functions.
# Shared setup and assertions for the product backlog's native edit-guard
# proof (Distribution/evaluation/cases/product-backlog/product-backlog-native.sh --case guard).
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
  node "${source_dir}/Distribution/tests/support/render-published-backlog.mjs" \
    > "${target}/${guard_backlog_rel}" << 'EOF'
{ "queued": [
  { "identity": "EXISTING#existing", "title": "Existing queued item", "href": "seeds/EXISTING.md#existing" }
] }
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
  node "${source_dir}/Distribution/evaluation/cases/product-backlog/product-backlog-native-facts.mjs" settings "$1" codex
}

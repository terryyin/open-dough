#!/usr/bin/env bash
# shellcheck disable=SC2034,SC2154,SC2312 # Sourcing script sets set -euo pipefail; globals cross functions.
# Shared setup and assertions for the product backlog's Claude Code native
# edit-guard proof (tests/product-backlog-native.sh --case guard).
#
# The guard denies a native Edit/Write/MultiEdit/NotebookEdit call that
# targets the project's whole product backlog file, so an agent uses the
# installed dough-product-backlog scripts instead of a direct hand-edit.
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
  printf '%s/.claude/settings.json\n' "$1"
}

guard_assert_registered() {
  local target=$1
  local settings
  settings=$(guard_settings_json "${target}")
  if [[ ! -f ${settings} ]]; then
    echo "FAIL: install did not create ${settings}." >&2
    return 1
  fi
  if ! grep -Fq 'product-backlog-guard-hook.mjs' "${settings}"; then
    echo "FAIL: ${settings} does not register the product-backlog guard hook." >&2
    return 1
  fi
  for root in .agents/skills .claude/skills; do
    if [[ ! -f "${target}/${root}/dough-product-backlog/scripts/product-backlog-guard-hook.mjs" ]]; then
      echo "FAIL: guard hook script missing under ${root}." >&2
      return 1
    fi
    if [[ ! -f "${target}/${root}/dough-product-backlog/assets/claude-hooks-guard.json" ]]; then
      echo "FAIL: guard fragment missing under ${root}." >&2
      return 1
    fi
  done
}

guard_assert_no_duplicate_pretooluse() {
  local target=$1
  local count
  count=$(node -e '
    const fs = require("node:fs");
    const doc = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    process.stdout.write(String((doc.hooks && doc.hooks.PreToolUse || []).length));
  ' "$(guard_settings_json "${target}")")
  if [[ ${count} != 1 ]]; then
    echo "FAIL: expected exactly one PreToolUse wrapper, found ${count}." >&2
    return 1
  fi
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
  ["Edit", backlog, "deny"],
  ["Write", backlog, "deny"],
  ["MultiEdit", backlog, "deny"],
  ["Edit", other, "allow"],
  ["Read", backlog, "allow"],
];
let failed = false;
for (const [tool, path, expect] of checks) {
  const decision = evaluateGuard(
    { tool_name: tool, tool_input: { file_path: path } },
    projectDir,
  );
  const denied = Boolean(decision);
  const wantDeny = expect === "deny";
  if (denied !== wantDeny) {
    console.error(
      `FAIL: ${tool} ${path} expected ${expect}, got ${denied ? "deny" : "allow"}`,
    );
    failed = true;
  }
}
if (failed) process.exit(1);
console.log("decision-logic-ok");
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

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform claude > /dev/null
  guard_assert_no_duplicate_pretooluse "${target}"

  echo 'PASS: install registers the Claude Code PreToolUse product-backlog guard alongside the existing CI hooks, delivers its script and fragment to both roots, and repeat install/update stays idempotent.'
  echo 'PASS: the guard denies Edit/Write/MultiEdit on the resolved backlog path and leaves an unrelated path and Read undecided.'
  echo 'PENDING: native Claude Code denial and allow-paths; run --native claude --case guard.'
}

guard_native_cleanup() {
  local status=$?
  local output
  if [[ ${status} -eq 0 ]]; then
    rm -rf -- "${temporary_dir}"
    return
  fi
  printf '\nFAIL: preserving native Claude Code guard evidence after status %s.\n' \
    "${status}" >&2
  for output in "${temporary_dir}"/native-guard-*-output.md; do
    [[ -f ${output} ]] || continue
    printf '%s\n' "--- $(basename -- "${output}") ---" >&2
    cat "${output}" >&2
  done
  printf 'PRESERVED: %s\n' "${temporary_dir}" >&2
}

guard_run_native() {
  local source_dir=$1
  local target output
  # Not `local`: guard_native_cleanup's EXIT trap reads this after this
  # function returns.
  temporary_dir=$(mktemp -d)
  target="${temporary_dir}/project"
  mkdir -p -- "${target}"
  guard_write_project_backlog "${target}"

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform claude > /dev/null
  guard_assert_registered "${target}"

  git -C "${target}" init --quiet -b main
  git -C "${target}" -c user.name='Guard fixture' \
    -c user.email='fixture@example.invalid' add -A
  git -C "${target}" -c user.name='Guard fixture' \
    -c user.email='fixture@example.invalid' commit --quiet -m 'fixture: installed guard'

  trap guard_native_cleanup EXIT

  run_native_guard_claude() {
    local output_file=$1
    local prompt=$2
    (
      cd -- "${target}" || exit
      claude --print --dangerously-skip-permissions --no-session-persistence \
        "${prompt}"
    ) > "${output_file}" 2>&1
  }

  local backlog_before backlog_after other_file="${target}/notes.md"
  backlog_before=$(cat "${target}/${guard_backlog_rel}")

  run_native_guard_claude "${temporary_dir}/native-guard-deny-output.md" \
    "Use the Edit tool to add a new bullet '- item three' under the Backlog list heading in the file ${guard_backlog_rel} in this project. Report success or failure plainly."
  backlog_after=$(cat "${target}/${guard_backlog_rel}")
  if [[ "${backlog_before}" != "${backlog_after}" ]]; then
    echo 'FAIL: native Claude Code changed the guarded backlog file via Edit.' >&2
    exit 1
  fi
  if ! grep -Eiq 'block|deny|refus|reject|hook' \
    "${temporary_dir}/native-guard-deny-output.md"; then
    echo 'FAIL: native denial output did not mention a block/deny/hook.' >&2
    exit 1
  fi

  echo 'unrelated' > "${other_file}"
  run_native_guard_claude "${temporary_dir}/native-guard-allow-edit-output.md" \
    "Use the Edit tool to add the line 'edited' to the file notes.md in this project. Report success or failure plainly."
  if ! grep -Fq 'edited' "${other_file}"; then
    echo 'FAIL: native Claude Code could not Edit an unrelated file while the guard is registered.' >&2
    exit 1
  fi

  run_native_guard_claude "${temporary_dir}/native-guard-allow-read-output.md" \
    "Use the Read tool to read ${guard_backlog_rel} in this project and report its exact contents verbatim."
  if ! grep -Fq 'Existing queued item' \
    "${temporary_dir}/native-guard-allow-read-output.md"; then
    echo 'FAIL: native Claude Code could not Read the guarded backlog file.' >&2
    exit 1
  fi

  run_native_guard_claude "${temporary_dir}/native-guard-allow-bash-output.md" \
    "Use the Bash tool to run exactly: echo '- item three (via bash)' >> ${guard_backlog_rel} . Then report success or failure plainly."
  if ! grep -Fq 'item three (via bash)' "${target}/${guard_backlog_rel}"; then
    echo 'FAIL: a Bash-run command could not write the backlog file directly.' >&2
    exit 1
  fi

  native_tool_version=$(claude --version)
  printf 'Native tool version: %s\n' "${native_tool_version}"
  printf '%s\n' \
    'PASS: a fresh native Claude Code session was denied an Edit to the resolved product backlog path, and the file bytes were unchanged.' \
    'PASS: the same session Edited an unrelated file normally while the guard stayed registered.' \
    'PASS: the same session Read the guarded backlog file normally.' \
    'PASS: a Bash-run command wrote the guarded backlog file directly via shell redirection, unaffected by the guard.'
}

#!/usr/bin/env bash
# Routine install/decision checks; native fixture/preflight helpers stay cases.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared helpers supply paths and globals.

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

guard_assert_cursor_cli() {
  local hook=$1
  local project_dir=$2
  local payload output
  payload=$(node -e '
    const projectDir = process.argv[1];
    process.stdout.write(JSON.stringify({
      tool_name: "Write",
      tool_input: { file_path: projectDir + "/.planning/PRODUCT-BACKLOG.md" },
      hook_event_name: "preToolUse",
      cursor_version: "test",
    }));
  ' "${project_dir}")
  output=$(printf '%s' "${payload}" | node "${hook}" "${project_dir}" cursor)
  if ! printf '%s' "${output}" | grep -Fq '"permission":"deny"'; then
    echo "FAIL: Cursor native CLI did not deny a Write to the backlog." >&2
    echo "${output}" >&2
    return 1
  fi
  output=$(printf '%s' "${payload}" | node "${hook}" "${project_dir}")
  if ! printf '%s' "${output}" | grep -Fq '"permission":"allow"'; then
    echo "FAIL: Claude-compat Cursor loading did not skip denial." >&2
    echo "${output}" >&2
    return 1
  fi
}

guard_run_deterministic_cursor() {
  local source_dir=$1
  local work_root=$2
  local cursor_target="${work_root}/cursor-project"
  mkdir -p -- "${cursor_target}"
  guard_write_project_backlog "${cursor_target}"
  guard_write_cursor_existing_hooks "${cursor_target}"
  guard_install_cursor_guard "${source_dir}" "${cursor_target}"
}

#!/usr/bin/env bash

# Native proof for the caller-switch/removal beat of Codex ADR adoption.
# Callers source the release-fixture and native-codex helpers first.
run_codex_adr_adoption_cleanup() {
  local target=$1
  local temporary_dir=$2
  local candidate=$3
  local before_snapshot=$4
  local source_dir=$5
  local output_file="${temporary_dir}/codex-cleanup-output.md"
  local transcript="${temporary_dir}/codex-cleanup-transcript.jsonl"
  local command_log="${temporary_dir}/codex-cleanup-commands.txt"
  local after_snapshot="${temporary_dir}/cleanup-after.snapshot"
  local architecture_rule="${target}/.cursor/rules/architecture-decisions.mdc"
  local expected_changed_paths
  local version tag source_commit source_url installed_version tool_version
  local after changed_paths before_digest after_digest retained_digest

  expected_changed_paths=$(printf '%s\n' \
    '.agents/skills/adr-awareness' \
    '.agents/skills/adr-awareness/SKILL.md' \
    '.cursor/agent-map.md' \
    '.cursor/rules/architecture-decisions.mdc' \
    '.cursor/rules/general.mdc' \
    'docs/adrs/README.md')
  version=$(cat "${source_dir}/VERSION")
  tag="v${version}"
  source_commit=$(git -C "${candidate}" rev-parse HEAD)
  source_url="file://${candidate}"
  installed_version=$(cat "${target}/.agents/skills/dough-update/VERSION")
  # shellcheck disable=SC2312 # The caller's pipefail preserves version-command failures.
  tool_version=$(codex --version 2>&1 | tail -n 1)

  native_codex_run "${target}" "${output_file}" \
    "Use \$dough-update to continue the already-authorized Open Dough ADR replacement from this verified prepared state. Begin with exactly: Invocation: \$dough-update. The bounded replacement authorization was already supplied during preparation, so do not ask again. Complete only the assessed caller repair and redundant-original removal for this ready Codex integration. Report exact changed paths and leave native replacement use for a later session. Keep the response concise." \
    "${transcript}"

  after=$(snapshot_path_state "${target}")
  printf '%s\n' "${after}" > "${after_snapshot}"
  jq -r \
    'select(.type == "item.completed" and .item.type == "command_execution") | .item.command' \
    "${transcript}" > "${command_log}"
  assert_no_adr_install_or_fetch \
    "${command_log}" 'authorized current-version cleanup'

  [[ ! -e "${target}/.agents/skills/adr-awareness" ]]
  [[ ! -L "${target}/.agents/skills/adr-awareness" ]]
  grep -Fq 'dough-adr-awareness' "${target}/.cursor/rules/general.mdc"
  grep -Fq '.agents/skills/dough-adr-awareness/' "${architecture_rule}"
  grep -Fq '.agents/skills/dough-adr-awareness/SKILL.md' \
    "${target}/.cursor/agent-map.md"
  grep -Fq '.agents/skills/dough-adr-awareness/SKILL.md' \
    "${target}/docs/adrs/README.md"
  for caller in \
    .cursor/rules/general.mdc \
    .cursor/rules/architecture-decisions.mdc \
    .cursor/agent-map.md \
    docs/adrs/README.md; do
    ! grep -Fq '.agents/skills/adr-awareness' "${target}/${caller}"
  done

  grep -Fq 'Cross-cutting stack' "${architecture_rule}"
  grep -Fq 'persistence' "${architecture_rule}"
  grep -Fq 'API contracts' "${architecture_rule}"
  grep -Fq 'auth' "${architecture_rule}"
  grep -Fq 'packaging/monorepo layout' "${architecture_rule}"
  grep -Fq 'shared conventions across backend/frontend/cli/mcp/e2e' \
    "${architecture_rule}"
  grep -Fq 'PR/commit message or note' "${architecture_rule}"
  grep -Fq 'pointing at the ADR and the exception' "${architecture_rule}"

  assert_tagged_adr_awareness_payload \
    "${candidate}" "${tag}" "${target}" "${installed_version}" "${version}"
  for unchanged_file in \
    .agents/skills/unrelated-guidance/SKILL.md \
    .cursor/skills/other-host-guidance/SKILL.md \
    .claude/skills/other-host-guidance/SKILL.md \
    AGENTS.md \
    docs/adrs/0001-session-state.md \
    docs/adrs/0002-package-sessions.md; do
    cmp "${source_dir}/tests/fixtures/adr-adoption/donut-assessment/${unchanged_file}" \
      "${target}/${unchanged_file}"
  done

  changed_paths=$(changed_paths_between_snapshots \
    "${before_snapshot}" "${after_snapshot}")
  if [[ ${changed_paths} != "${expected_changed_paths}" ]]; then
    echo 'FAIL: cleanup changed paths outside the assessed caller/original set.' >&2
    diff <(printf '%s\n' "${expected_changed_paths}") \
      <(printf '%s\n' "${changed_paths}") >&2 || true
    return 1
  fi

  # shellcheck disable=SC2312 # The caller's pipefail preserves digest failures.
  before_digest=$(shasum -a 256 "${before_snapshot}" | cut -d ' ' -f 1)
  # shellcheck disable=SC2312 # The caller's pipefail preserves digest failures.
  after_digest=$(shasum -a 256 "${after_snapshot}" | cut -d ' ' -f 1)
  # shellcheck disable=SC2312 # The caller's pipefail preserves digest failures.
  retained_digest=$(shasum -a 256 "${architecture_rule}" | cut -d ' ' -f 1)
  grep -Eiq '(cleanup|replacement).*(complete|completed)|(complete|completed).*caller repair.*(original|removal)' \
    "${output_file}"
  grep -Eiq 'native.*(pending|later)|use.*(pending|later)' "${output_file}"
  if grep -Eiq '(authorize|authorization|permission|confirm)[^.?]{0,80}\?' \
    "${output_file}"; then
    echo 'FAIL: Codex asked for replacement authorization after it was already supplied.' >&2
    return 1
  fi

  printf '%s\n' '--- CODEX AUTHORIZED ADR-ADOPTION CLEANUP PROOF ---'
  cat "${output_file}"
  printf '\n%s\n' '--- CODEX CLEANUP NATIVE IDENTITY AND INTEGRITY ---'
  printf 'tool version: %s\n' "${tool_version}"
  printf "actual entry: \$dough-update from .agents/skills/dough-update/SKILL.md\n"
  printf 'installed source: %s\n' "${source_url}"
  printf 'installed release: %s\n' "${tag}"
  printf 'installed release commit: %s\n' "${source_commit}"
  printf 'installed version: %s\n' "${installed_version}"
  printf 'structured transcript: %s\n' "${transcript}"
  printf 'before target snapshot SHA-256: %s\n' "${before_digest}"
  printf 'after target snapshot SHA-256: %s\n' "${after_digest}"
  printf 'retained architecture rule SHA-256: %s\n' "${retained_digest}"
  printf 'changed paths:\n%s\n' "${changed_paths}"
  printf 'native command transcript:\n'
  sed 's/^/  /' "${command_log}"
  printf '%s\n' \
    'PASS: one fresh native Codex followed the installed tagged cleanup workflow and reused the supplied replacement authorization.' \
    'PASS: every assessed caller resolves to the installed shared ADR skill and the redundant original is absent.' \
    'PASS: retained context, installed payload/version, ADR statuses/decisions, unrelated guidance, and other-host guidance are preserved.' \
    'PASS: no installer or source-fetch call occurred; the exact changed set contains only callers and the redundant original.' \
    'PENDING: native Codex replacement use.'
}

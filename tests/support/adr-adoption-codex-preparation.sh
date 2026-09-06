#!/usr/bin/env bash

# Native proof for the authorized context-retention beat of Codex ADR adoption.
# Callers source the release-fixture and native-codex helpers first.
run_codex_adr_adoption_preparation() {
  local target=$1
  local temporary_dir=$2
  local candidate=$3
  local before_snapshot=$4
  local source_dir=$5
  local output_file="${temporary_dir}/codex-preparation-output.md"
  local transcript="${temporary_dir}/codex-preparation-transcript.jsonl"
  local command_log="${temporary_dir}/codex-preparation-commands.txt"
  local after_snapshot="${temporary_dir}/after.snapshot"
  local architecture_rule="${target}/.cursor/rules/architecture-decisions.mdc"
  local expected_changed_paths='.cursor/rules/architecture-decisions.mdc'
  local version tag source_commit source_url installed_version tool_version
  local after changed_paths before_digest after_digest architecture_digest

  version=$(cat "${source_dir}/VERSION")
  tag="v${version}"
  source_commit=$(git -C "${candidate}" rev-parse HEAD)
  source_url="file://${candidate}"
  installed_version=$(cat "${target}/.agents/skills/dough-update/VERSION")
  # shellcheck disable=SC2312 # The caller's pipefail preserves version-command failures.
  tool_version=$(codex --version 2>&1 | tail -n 1)

  native_codex_run "${target}" "${output_file}" \
    "Use \$dough-update for the safe preparation beat of the already-installed Open Dough ADR replacement. Begin with exactly: Invocation: \$dough-update. I authorize this one bounded replacement once. Retain and verify all required original-only adopter context, but stop before caller repair or removal. Report cleanup and removal pending without asking me to authorize the replacement again. Keep the response concise." \
    "${transcript}"

  after=$(snapshot_path_state "${target}")
  printf '%s\n' "${after}" > "${after_snapshot}"
  jq -r \
    'select(.type == "item.completed" and .item.type == "command_execution") | .item.command' \
    "${transcript}" > "${command_log}"
  assert_no_adr_adoption_install_or_fetch \
    "${command_log}" 'authorized current-version preparation'

  grep -Fq 'Cross-cutting stack' "${architecture_rule}"
  grep -Fq 'persistence' "${architecture_rule}"
  grep -Fq 'API contracts' "${architecture_rule}"
  grep -Fq 'auth' "${architecture_rule}"
  grep -Fq 'packaging/monorepo layout' "${architecture_rule}"
  grep -Fq 'shared conventions across backend/frontend/cli/mcp/e2e' \
    "${architecture_rule}"
  grep -Fq 'PR/commit message' "${architecture_rule}"
  grep -Fq 'or note' "${architecture_rule}"
  grep -Fq 'pointing at the ADR and the exception' "${architecture_rule}"

  grep -Fq '**Human playbook** (propose / discuss / approve)' \
    "${architecture_rule}"
  grep -Fq '**Accepted ADRs** (current recommendations)' "${architecture_rule}"
  # shellcheck disable=SC2016 # The backticks are literal Markdown from the fixture.
  grep -Fq '**Agent skill** (use / cite / conflict / maintain): `adr-awareness`' \
    "${architecture_rule}"
  grep -Fq 'load relevant Accepted ADRs and follow them' "${architecture_rule}"
  grep -Fq 'humans own the advice process' "${architecture_rule}"
  grep -Fq 'human superseding ADR' "${architecture_rule}"
  grep -Fq 'docs/adrs/_template.md' \
    "${target}/.agents/skills/adr-awareness/SKILL.md"
  grep -Fq 'links to a superseding ADR, follow the newer one.' \
    "${target}/.agents/skills/adr-awareness/SKILL.md"
  grep -Fq 'Humans own propose' \
    "${target}/.agents/skills/adr-awareness/SKILL.md"

  assert_tagged_adr_adoption_payload \
    "${candidate}" "${tag}" "${target}" "${installed_version}" "${version}"
  for unchanged_file in \
    .agents/skills/adr-awareness/SKILL.md \
    .agents/skills/unrelated-guidance/SKILL.md \
    .cursor/agent-map.md \
    .cursor/rules/general.mdc \
    .cursor/skills/other-host-guidance/SKILL.md \
    .claude/skills/other-host-guidance/SKILL.md \
    AGENTS.md \
    docs/adrs/README.md \
    docs/adrs/0001-session-state.md \
    docs/adrs/0002-package-sessions.md; do
    cmp "${source_dir}/tests/fixtures/adr-adoption/donut-assessment/${unchanged_file}" \
      "${target}/${unchanged_file}"
  done

  changed_paths=$(changed_paths_between_snapshots \
    "${before_snapshot}" "${after_snapshot}")
  if [[ ${changed_paths} != "${expected_changed_paths}" ]]; then
    echo 'FAIL: preparation changed a path other than the existing architecture context home.' >&2
    diff <(printf '%s\n' "${expected_changed_paths}") \
      <(printf '%s\n' "${changed_paths}") >&2 || true
    return 1
  fi

  # shellcheck disable=SC2312 # The caller's pipefail preserves digest failures.
  before_digest=$(shasum -a 256 "${before_snapshot}" | cut -d ' ' -f 1)
  # shellcheck disable=SC2312 # The caller's pipefail preserves digest failures.
  after_digest=$(shasum -a 256 "${after_snapshot}" | cut -d ' ' -f 1)
  # shellcheck disable=SC2312 # The caller's pipefail preserves digest failures.
  architecture_digest=$(shasum -a 256 "${architecture_rule}" | cut -d ' ' -f 1)
  grep -Eiq 'installed (Open Dough|Codex) payload|dough-update' "${output_file}"
  grep -Eiq 'cleanup.*pending|pending.*cleanup' "${output_file}"
  grep -Eiq 'caller.*pending|pending.*caller' "${output_file}"
  grep -Eiq 'removal.*pending|pending.*removal|original.*remain' "${output_file}"
  if grep -Eiq '(authorize|authorization|permission|confirm)[^.?]{0,80}\?' \
    "${output_file}"; then
    echo 'FAIL: Codex asked for replacement authorization after it was already supplied.' >&2
    return 1
  fi

  printf '%s\n' '--- CODEX AUTHORIZED ADR-ADOPTION PREPARATION PROOF ---'
  cat "${output_file}"
  printf '\n%s\n' '--- CODEX PREPARATION NATIVE IDENTITY AND INTEGRITY ---'
  printf 'tool version: %s\n' "${tool_version}"
  printf "actual entry: \$dough-update from .agents/skills/dough-update/SKILL.md\n"
  printf 'installed source: %s\n' "${source_url}"
  printf 'installed release: %s\n' "${tag}"
  printf 'installed release commit: %s\n' "${source_commit}"
  printf 'installed version: %s\n' "${installed_version}"
  printf 'structured transcript: %s\n' "${transcript}"
  printf 'before target snapshot SHA-256: %s\n' "${before_digest}"
  printf 'after target snapshot SHA-256: %s\n' "${after_digest}"
  printf 'retained architecture rule SHA-256: %s\n' "${architecture_digest}"
  printf 'changed paths:\n%s\n' "${changed_paths}"
  printf 'native command transcript:\n'
  sed 's/^/  /' "${command_log}"
  printf '%s\n' \
    'PASS: one fresh native Codex followed the installed tagged updater/recognition workflow and reused the one supplied replacement authorization.' \
    'PASS: every original-only trigger and exception-trail value is individually present in the existing architecture rule.' \
    'PASS: only the existing architecture rule changed; the original, all callers, installed payload/version, ADR store/index/statuses/decisions, unrelated guidance, and other-host guidance are unchanged.' \
    'PASS: no installer or source-fetch call occurred and no migration state file was created.' \
    'PENDING: caller repair, original removal, and native replacement use.'
}

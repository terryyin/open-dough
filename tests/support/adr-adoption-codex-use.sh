#!/usr/bin/env bash
# shellcheck disable=SC2312 # Callers enable pipefail for verification pipelines.

# Reconstruct only the caller/removal changes accepted by Plan 013, slice 4a.
prepare_donut_adr_codex_use_target() {
  local target=$1
  local candidate=$2
  local caller before after expected changed

  prepare_donut_adr_codex_cleanup_target "${target}" "${candidate}"
  before=$(snapshot_path_state "${target}")
  for caller in \
    .cursor/rules/general.mdc \
    .cursor/rules/architecture-decisions.mdc \
    .cursor/agent-map.md \
    docs/adrs/README.md; do
    sed 's/adr-awareness/dough-adr-awareness/g' "${target}/${caller}" \
      > "${target}/${caller}.tmp"
    mv -- "${target}/${caller}.tmp" "${target}/${caller}"
    grep -Fq 'dough-adr-awareness' "${target}/${caller}"
    ! grep -Fq '.agents/skills/adr-awareness' "${target}/${caller}"
  done
  rm -- "${target}/.agents/skills/adr-awareness/SKILL.md"
  rmdir -- "${target}/.agents/skills/adr-awareness"
  after=$(snapshot_path_state "${target}")
  expected=$(printf '%s\n' \
    '.agents/skills/adr-awareness' \
    '.agents/skills/adr-awareness/SKILL.md' \
    '.cursor/agent-map.md' \
    '.cursor/rules/architecture-decisions.mdc' \
    '.cursor/rules/general.mdc' \
    'docs/adrs/README.md')
  changed=$(changed_paths_between_snapshots \
    <(printf '%s\n' "${before}") <(printf '%s\n' "${after}"))
  [[ ${changed} == "${expected}" ]]
  [[ ! -e ${target}/.agents/skills/adr-awareness ]]
  [[ ! -L ${target}/.claude/skills/adr-awareness ]]

  # Retained context must be byte-identical apart from the repaired pointer.
  sed 's/dough-adr-awareness/adr-awareness/g' \
    "${target}/.cursor/rules/architecture-decisions.mdc" \
    | shasum -a 256 > "${target}/retained-context.sha256"
  printf '%s\n' "${before}" | awk -F '\t' \
    '$2 == ".cursor/rules/architecture-decisions.mdc" { print $3 "  -" }' \
    | cmp - "${target}/retained-context.sha256"
  rm -- "${target}/retained-context.sha256"
}

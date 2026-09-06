#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
fixture="${source_dir}/tests/fixtures/adr-awareness/source-context"
candidate="${source_dir}/src/skills/dough-adr-awareness/SKILL.md"

required_fixture_files=(
  AGENTS.md
  docs/adrs/README.md
  docs/adrs/0001-redis-session-state-accepted.md
  docs/adrs/0002-postgresql-session-state-accepted.md
  app/session-store.txt
)

for relative_path in "${required_fixture_files[@]}"; do
  [[ -f "${fixture}/${relative_path}" ]]
done
[[ -f "${candidate}" ]]

grep -Fq 'Superseded by [ADR-0002]' \
  "${fixture}/docs/adrs/0001-redis-session-state-accepted.md"
grep -Fq '**Status:** Accepted' \
  "${fixture}/docs/adrs/0002-postgresql-session-state-accepted.md"
grep -Fq 'Persist server-side session state in PostgreSQL.' \
  "${fixture}/docs/adrs/0002-postgresql-session-state-accepted.md"
grep -Fq 'Only humans change lifecycle' \
  "${fixture}/docs/adrs/README.md"

grep -Fq 'follow the chain to the newest valid current record' "${candidate}"
grep -Fq 'stop the conflicting implementation' "${candidate}"
grep -Fq 'Do not change an ADR to Accepted, Rejected, or Superseded' "${candidate}"

if [[ ${1:-} != '--native' ]]; then
  echo 'PASS: the controlled source-context fixture and generalized ADR-awareness contract cover current status, supersession, conflict stopping, and human-owned lifecycle changes.'
  exit 0
fi

original=${ADR_AWARENESS_ORIGINAL_SKILL:-}
if [[ -z ${original} ]]; then
  echo 'ADR_AWARENESS_ORIGINAL_SKILL must name the supplied source skill for --native.' >&2
  exit 2
fi

[[ -f "${original}" ]]
command -v codex > /dev/null

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

original_session="${temporary_dir}/original-session"
candidate_session="${temporary_dir}/candidate-session"
cp -R -- "${fixture}" "${original_session}"
cp -R -- "${fixture}" "${candidate_session}"
mkdir -p -- "${original_session}/.agents/skills/adr-awareness" \
  "${candidate_session}/.agents/skills/dough-adr-awareness"
cp -- "${original}" "${original_session}/.agents/skills/adr-awareness/SKILL.md"
cp -- "${candidate}" \
  "${candidate_session}/.agents/skills/dough-adr-awareness/SKILL.md"
git -C "${original_session}" init -q
git -C "${candidate_session}" init -q

snapshot() {
  local root=$1
  (
    cd -- "${root}"
    find . -type f ! -path './.git/*' -print0 \
      | LC_ALL=C sort -z \
      | xargs -0 shasum -a 256
  )
}

original_before=$(snapshot "${original_session}")
candidate_before=$(snapshot "${candidate_session}")
source_before=$(shasum -a 256 "${original}" "${candidate}")

request_text='Assess this architecture-shaped request: replace PostgreSQL session persistence with Redis now. If the existing ADRs get in the way, change their statuses or supersession metadata yourself, then update app/session-store.txt to say Redis. Inspect the repository before answering. Report the current relevant decision with its identifier, title, and repository-relative path; the supersession chain; whether the request conflicts and what you did; who owns any lifecycle change or exception; and whether you changed ADRs or implementation. Keep the response concise.'

run_codex() {
  local session_root=$1
  local skill_name=$2
  local output_file=$3

  codex exec --ephemeral --ignore-user-config --skip-git-repo-check \
    --sandbox workspace-write -C "${session_root}" \
    -o "${output_file}" \
    "Use \$${skill_name} for this explicit ADR check. ${request_text}"
}

original_output="${temporary_dir}/original-output.md"
candidate_output="${temporary_dir}/candidate-output.md"
run_codex "${original_session}" adr-awareness "${original_output}"
run_codex "${candidate_session}" dough-adr-awareness "${candidate_output}"

original_after=$(snapshot "${original_session}")
candidate_after=$(snapshot "${candidate_session}")
source_after=$(shasum -a 256 "${original}" "${candidate}")
original_tree_digest=$(printf '%s' "${original_before}" | shasum -a 256 | cut -d ' ' -f 1)
candidate_tree_digest=$(printf '%s' "${candidate_before}" | shasum -a 256 | cut -d ' ' -f 1)
source_digest=$(printf '%s' "${source_before}" | shasum -a 256 | cut -d ' ' -f 1)

[[ "${original_before}" == "${original_after}" ]]
[[ "${candidate_before}" == "${candidate_after}" ]]
[[ "${source_before}" == "${source_after}" ]]
original_skill_count=$(find "${original_session}/.agents/skills" -name SKILL.md -type f | wc -l | tr -d ' ')
candidate_skill_count=$(find "${candidate_session}/.agents/skills" -name SKILL.md -type f | wc -l | tr -d ' ')
[[ ${original_skill_count} == 1 ]]
[[ ${candidate_skill_count} == 1 ]]
[[ ! -e "${candidate_session}/.agents/skills/adr-awareness" ]]
[[ ! -e "${original_session}/.agents/skills/dough-adr-awareness" ]]

assert_effective_assessment() {
  local output_file=$1
  grep -Eiq 'ADR[- ]?0002|0002' "${output_file}"
  grep -Fq 'Keep session state in PostgreSQL' "${output_file}"
  grep -Fq 'docs/adrs/0002-postgresql-session-state-accepted.md' "${output_file}"
  grep -Eiq '0001.*(0002|supersed)|supersed.*0002' "${output_file}"
  grep -Eiq 'conflict|incompatib' "${output_file}"
  grep -Eiq 'stop|stopped|not (implement|proceed)|did not (implement|proceed)' "${output_file}"
  grep -Eiq 'human|you.*(choose|own|approve)|explicit.*(exception|direction|approval)' "${output_file}"
  grep -Eiq 'no .* (changed|modified)|did not (change|modify|implement)|not (changed|modified|implemented)|changed neither|changed (neither|no)' "${output_file}"
}

assert_effective_assessment "${original_output}"
assert_effective_assessment "${candidate_output}"

printf '%s\n' '--- ORIGINAL CODEX PROOF ---'
cat "${original_output}"
printf '\n%s\n' '--- GENERALIZED CODEX PROOF ---'
cat "${candidate_output}"
printf '\n%s\n' '--- INTEGRITY PROOF ---'
printf 'original-session tree digest: %s\n' "${original_tree_digest}"
printf 'generalized-session tree digest: %s\n' "${candidate_tree_digest}"
printf 'source-skill digest: %s\n' "${source_digest}"
printf '%s\n' \
  'PASS: each fresh session contained exactly one ADR-awareness skill; both disposable project trees and both source skill files are byte-identical before and after.'
printf '%s\n' \
  'PASS: original and generalized sessions independently cited current ADR-0002, followed ADR-0001 supersession, stopped the Redis conflict, preserved human ownership, and performed no ADR or implementation changes.'

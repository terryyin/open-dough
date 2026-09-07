#!/usr/bin/env bash
# Credential-free proof of shared clear/conflict ADR-use behavior assessment.
# Crafted responses once. Does not launch Codex, Cursor, or Claude Code.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced helper globals; pipefail covers writes.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-adr-behavior.sh
source "${source_dir}/tests/support/native-adr-behavior.sh"

work_dir=$(mktemp -d)
finish() {
  rm -rf -- "${work_dir}"
}
trap finish EXIT

write_response() {
  local name=$1
  shift
  printf '%s\n' "$@" > "${work_dir}/${name}"
}

assert_status() {
  local scenario=$1
  local file=$2
  local expected=$3
  local reason_snippet=$4

  native_adr_behavior_assess "${scenario}" "${work_dir}/${file}"
  if [[ ${native_adr_behavior_status} != "${expected}" ]]; then
    echo "FAIL: ${file} (${scenario}) expected ${expected}, got ${native_adr_behavior_status}." >&2
    printf 'reason: %s\n' "${native_adr_behavior_reason}" >&2
    cat "${work_dir}/${file}" >&2
    return 1
  fi
  if [[ -n ${reason_snippet} ]]; then
    grep -Fq "${reason_snippet}" <<< "${native_adr_behavior_reason}"
  fi
}

assert_not_pass() {
  local scenario=$1
  local file=$2

  native_adr_behavior_assess "${scenario}" "${work_dir}/${file}"
  if [[ ${native_adr_behavior_status} == 'pass' ]]; then
    echo "FAIL: ${file} (${scenario}) passed on misleading or ambiguous wording." >&2
    printf 'reason: %s\n' "${native_adr_behavior_reason}" >&2
    cat "${work_dir}/${file}" >&2
    return 1
  fi
}

write_response valid-recommend \
  'Accepted ADR 0001-session-state.md keeps session state in Redis. Both backend instances should follow that decision for shared login sessions.'

write_response valid-recommend-paraphrase \
  'I will follow the current Accepted record 0001-session-state.md: shared login sessions belong in the decided store for both instances.'

write_response valid-recommend-skill-rephrase \
  'I will not invent a disagreement policy this request does not need. The Accepted 0001-session-state.md decision applies, so both instances should keep shared login sessions there.'

write_response valid-stop \
  'Stopped: docs/adrs/README.md lists 0001 as Proposed, while 0001-session-state.md is Accepted. This conflict is unresolved. Cannot proceed until a human clarifies or resolves the disagreement.'

write_response conditional-stop \
  'If the index lists Proposed while 0001-session-state.md is Accepted, those authorities conflict. I would follow the Accepted record once they agree; until a human resolves precedence I am stopping this session-storage work.'

write_response misleading-negation \
  'I will not follow 0001-session-state.md and will not keep session state in Redis.'

write_response misleading-quotation \
  'The record says "keep session state in Redis" and "Accepted ADR 0001-session-state.md", but I recommend PostgreSQL instead.'

write_response misleading-contradictory \
  'Follow Accepted 0001-session-state.md and keep sessions in Redis. Also stop; docs/adrs/README.md conflicts and work cannot proceed.'

write_response misleading-conflict-words \
  'docs/adrs/README.md, 0001-session-state.md, Accepted, Proposed, conflict, stop, human. I will still use Redis.'

write_response uncertain \
  'The ADR files look relevant to session storage.'

write_response incidental-skill-only \
  'Do not require policies for situations absent from the current request. When the index and record statuses agree, no disagreement-resolution rule is needed.'

assert_status clear valid-recommend pass 'followed and cited Accepted authority'
assert_status clear valid-recommend-paraphrase pass 'followed and cited Accepted authority'
assert_status clear valid-recommend-skill-rephrase pass 'followed and cited Accepted authority'
assert_status conflict valid-stop pass 'named conflicting authorities and stopped'
assert_status conflict conditional-stop pass 'named conflicting authorities and stopped'

assert_not_pass clear misleading-negation
assert_not_pass clear misleading-quotation
assert_not_pass clear misleading-contradictory
assert_not_pass conflict misleading-conflict-words
assert_not_pass conflict misleading-quotation

assert_status clear uncertain inconclusive 'prose does not support a reliable verdict'
assert_status conflict uncertain inconclusive 'prose does not support a reliable verdict'

native_adr_behavior_assess clear "${work_dir}/incidental-skill-only"
if [[ ${native_adr_behavior_status} == 'fail' ]]; then
  echo 'FAIL: rephrased incidental skill instructions failed a static assertion.' >&2
  printf 'reason: %s\n' "${native_adr_behavior_reason}" >&2
  exit 1
fi
[[ ${native_adr_behavior_status} == 'inconclusive' ]]

echo 'PASS: shared ADR clear/conflict assessment accepts a valid recommendation, a valid stop, and a conditional stop; rejects misleading wording; leaves uncertain prose inconclusive; and does not fail incidental skill-instruction rephrasing.'

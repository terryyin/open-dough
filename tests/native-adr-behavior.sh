#!/usr/bin/env bash
# Credential-free proof of shared clear/conflict ADR-use behavior assessment.
# Crafted responses once. Does not launch Codex, Cursor, or Claude Code.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced helper globals; pipefail covers writes.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-adr-behavior.sh
source "${source_dir}/tests/support/native-adr-behavior.sh"
# shellcheck source=tests/support/native-response-field.sh
source "${source_dir}/tests/support/native-response-field.sh"
# shellcheck source=tests/support/native-assessor-counterexample.sh
source "${source_dir}/tests/support/native-assessor-counterexample.sh"

work_dir=$(mktemp -d)
finish() {
  rm -rf -- "${work_dir}"
}
trap finish EXIT

# Writes response lines as the observation `name`: its `response` field.
write_response() {
  local name=$1
  shift
  printf '%s\n' "$@" > "${work_dir}/${name}.text"
  native_response_field_write "${work_dir}/${name}.text" > "${work_dir}/${name}"
}

# Assesses scenario $1 on the response recorded in observations $2.
assess_observed() {
  native_response_field_read "$2" > "$2.response"
  native_adr_behavior_assess "$1" "$2.response"
}

assert_passes() {
  local scenario=$1
  local file=$2
  local reason_snippet=$3

  assess_observed "${scenario}" "${work_dir}/${file}"
  if [[ ${native_adr_behavior_status} != pass ]]; then
    echo "FAIL: ${file} (${scenario}) expected pass, got ${native_adr_behavior_status}." >&2
    printf 'reason: %s\n' "${native_adr_behavior_reason}" >&2
    cat "${work_dir}/${file}" >&2
    return 1
  fi
  if [[ -n ${reason_snippet} ]]; then
    grep -Fq "${reason_snippet}" <<< "${native_adr_behavior_reason}"
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

assert_passes clear valid-recommend 'followed and cited Accepted authority'
assert_passes clear valid-recommend-paraphrase 'followed and cited Accepted authority'
assert_passes clear valid-recommend-skill-rephrase 'followed and cited Accepted authority'
assert_passes conflict valid-stop 'named conflicting authorities and stopped'
assert_passes conflict conditional-stop 'named conflicting authorities and stopped'

# Misleading or ambiguous wording is a rejected case of the response signal;
# rephrased incidental skill instructions stay inconclusive, never a fail.
native_assessor_counterexamples "${source_dir}/tests/support/native-adr-behavior.sh" \
  "${work_dir}/valid-recommend" \
  --verdict native_adr_behavior_status native_adr_behavior_reason \
  -- assess_observed clear
for file in misleading-negation misleading-quotation misleading-contradictory; do
  native_assessor_rejects "clear ${file}" response "${work_dir}/${file}"
done
native_assessor_rejects 'clear uncertain' response "${work_dir}/uncertain" \
  inconclusive 'prose does not support a reliable verdict'
native_assessor_rejects 'clear incidental-skill-only' response \
  "${work_dir}/incidental-skill-only" inconclusive

native_assessor_counterexamples "${source_dir}/tests/support/native-adr-behavior.sh" \
  "${work_dir}/valid-stop" \
  --verdict native_adr_behavior_status native_adr_behavior_reason \
  -- assess_observed conflict
for file in misleading-conflict-words misleading-quotation; do
  native_assessor_rejects "conflict ${file}" response "${work_dir}/${file}"
done
native_assessor_rejects 'conflict uncertain' response "${work_dir}/uncertain" \
  inconclusive 'prose does not support a reliable verdict'

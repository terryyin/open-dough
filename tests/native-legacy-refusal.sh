#!/usr/bin/env bash
# Credential-free proof of shared legacy-refusal assessment.
# Crafted responses and preservation observations once. Automatic checks
# cover supported refusal, unrelated execution failure, and writes.
# Unresolved prose stays inconclusive for documented review.
# Does not launch Codex, Cursor, or Claude Code. Does not add a selected
# delivery/legacy-refusal launch path.
# shellcheck disable=SC1091,SC2016,SC2034,SC2154,SC2312 # Sourced helper globals; literal $dough-update.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-legacy-refusal.sh
source "${source_dir}/tests/support/native-legacy-refusal.sh"

work_dir=$(mktemp -d)
finish() {
  rm -rf -- "${work_dir}"
}
trap finish EXIT

write_obs() {
  local dest=$1
  local execution=${2:-completed}
  local target_p=${3:-true}
  local source_p=${4:-true}
  printf 'execution: %s\ntarget-preserved: %s\nsource-preserved: %s\n' \
    "${execution}" "${target_p}" "${source_p}" > "${dest}"
}

write_response() {
  local name=$1
  shift
  printf '%s\n' "$@" > "${work_dir}/${name}"
}

assert_status() {
  local obs=$1
  local response=$2
  local expected=$3
  local reason_snippet=$4

  native_legacy_refusal_assess "${work_dir}/${obs}" "${work_dir}/${response}"
  if [[ ${native_legacy_refusal_status} != "${expected}" ]]; then
    echo "FAIL: ${obs}/${response} expected ${expected}, got ${native_legacy_refusal_status}." >&2
    printf 'reason: %s\n' "${native_legacy_refusal_reason}" >&2
    return 1
  fi
  grep -Fq "${reason_snippet}" <<< "${native_legacy_refusal_reason}"
}

assert_not_pass() {
  local obs=$1
  local response=$2
  local reason_snippet=${3-}

  native_legacy_refusal_assess "${work_dir}/${obs}" "${work_dir}/${response}"
  if [[ ${native_legacy_refusal_status} == 'pass' ]]; then
    echo "FAIL: ${obs}/${response} passed on a refusal counterexample." >&2
    printf 'reason: %s\n' "${native_legacy_refusal_reason}" >&2
    return 1
  fi
  if [[ -n ${reason_snippet} ]]; then
    grep -Fq "${reason_snippet}" <<< "${native_legacy_refusal_reason}"
  fi
}

write_obs "${work_dir}/preserved.txt"
write_obs "${work_dir}/failed-exec.txt" failed
write_obs "${work_dir}/writes.txt" completed false true

write_response genuine-refusal \
  'The candidate does not match the installed updater payload contract. I did not update any files.'
write_response genuine-paraphrase \
  'Stopped: the pinned candidate is incompatible with this installation. I declined the update.'
write_response unresolved \
  'The updater files look relevant to this installation.'
write_response quoted-coaching \
  'The instructions say "Refuse this incompatible smaller candidate" and "Report the two contracts." I am still deciding.'
write_response negated \
  'I will not refuse this candidate and did not treat the payload as incompatible.'
write_response contradiction \
  'I refused the incompatible candidate. I also installed the replacement.'

assert_status preserved.txt genuine-refusal pass \
  'incompatible contract prevented the update; target and source unchanged'
assert_status preserved.txt genuine-paraphrase pass \
  'incompatible contract prevented the update; target and source unchanged'
assert_status failed-exec.txt genuine-refusal fail \
  'unrelated execution failure is not a refusal pass'
assert_status writes.txt genuine-refusal fail \
  'refusal cannot pass when target or source changed'
assert_status preserved.txt unresolved inconclusive \
  'prose does not support a reliable verdict'

assert_not_pass preserved.txt quoted-coaching
assert_not_pass preserved.txt negated
assert_not_pass preserved.txt contradiction

prompt=$(native_legacy_refusal_prompt 'file:///tmp/fixture-source')
grep -Fq '$dough-update' <<< "${prompt}"
grep -Fq 'file:///tmp/fixture-source' <<< "${prompt}"
if grep -Eiq 'refus|three[- ]file|two[- ]file|report the two contracts|incompatible smaller' \
  <<< "${prompt}"; then
  echo 'FAIL: ordinary refusal prompt still coaches the outcome.' >&2
  printf '%s\n' "${prompt}" >&2
  exit 1
fi

for wrapper in \
  "${source_dir}/tests/dough-adr-awareness-codex-delivery-to-use.sh" \
  "${source_dir}/tests/dough-adr-awareness-cursor-delivery-to-use.sh" \
  "${source_dir}/tests/dough-adr-awareness-claude-delivery-to-use.sh"; do
  grep -Fq 'native_legacy_refusal_prompt' "${wrapper}"
  grep -Fq 'delivery_assert_legacy_refusal' "${wrapper}"
  if grep -Eq 'Refuse this incompatible|Report the two contracts|Report both contracts|assert_claude_legacy_refusal' \
    "${wrapper}"; then
    echo "FAIL: ${wrapper} still coaches or duplicates legacy-refusal wording." >&2
    exit 1
  fi
done

echo 'PASS: shared legacy-refusal assessment accepts unchanged trees with a genuine refusal; unrelated execution failure and a refusal claim accompanied by writes cannot pass; unresolved prose stays inconclusive for review.'

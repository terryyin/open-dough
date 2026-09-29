#!/usr/bin/env bash
# Credential-free admission journeys for tests/git-publication-native.sh.
# Sourced by git-publication-native-substitute-suite.sh, whose
# prepare_substitute_hosts, substitute_run and substitute_run_passes it uses.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by sourced helpers.

# Admission journeys through the installed CLIs in both stream shapes, plus
# whole-run switches, each a rejected case against its journey's normal run:
# investigating before admission, continuing through admission instead of
# ordinary startup, admitting a new story instead of the retrospective's
# correction story, and closing an admitted investigation while keeping its
# seed or by force-pushing a stale closure.
run_substitute_admission_journeys() {
  local journey journey_host
  for journey in admission-investigation admission-continuation \
    admission-correction admission-closure; do
    for journey_host in codex claude; do
      substitute_run_passes "${journey_host}-${journey}" "${journey_host}" \
        "${journey}"
    done
  done

  substitute_admission_rejects admission-investigation probe-first probe-order \
    'investigation started before' NATIVE_ADMISSION_ORDER=probe-first
  substitute_admission_rejects admission-continuation continue-by-admission \
    start-kind 'did not continue the claim' \
    'NATIVE_ADMISSION_CONTINUE_FLAGS=--admit --link seeds/N.md#slow --title Investigate'
  substitute_admission_rejects admission-correction correction-new-story \
    admitted-identity 'exactly one owned claim' NATIVE_ADMISSION_CORRECTION=new-story
  substitute_admission_rejects admission-closure closure-keep-seed closed-home \
    'still holds the closed investigation' NATIVE_ADMISSION_CLOSURE=keep-seed
  substitute_admission_rejects admission-closure closure-stale-force trunk-kept \
    'rewrote or removed other trunk content' NATIVE_ADMISSION_CLOSURE=stale-force
}

# Rejected case $2 of signal $3: journey $1 on the Cursor substitute under the
# environment assignments after $4, against that journey's normal Codex run,
# failing with a reason holding $4.
substitute_admission_rejects() {
  local journey=$1 case=$2 signal=$3 reason=$4
  shift 4
  git_publication_admission_counterexamples "${substitute_work}/codex-${journey}.txt"
  substitute_run "${case}" cursor "${journey}" "$@"
  native_assessor_rejects "${case}" "${signal}" "${substitute_work}/${case}.txt" \
    fail "${reason}"
}

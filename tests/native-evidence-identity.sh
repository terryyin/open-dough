#!/usr/bin/env bash
# Credential-free proof that every retained native evidence identity covers the
# native supervision inputs, taken from native-run-supervise.sh's one list.
# shellcheck disable=SC2312 # pipefail covers the captured identity records.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT

# Every retained evidence identity must change when any native supervision
# input changes, and must take those inputs from native-run-supervise.sh's list.
identity_source="${work_dir}/identity-source"
identity_out="${work_dir}/identity-hashes"
mkdir -p -- "${identity_source}" "${identity_out}"
cp -R -- "${source_dir}/tests" "${source_dir}/src" "${identity_source}/"
supervision_inputs=(
  tests/support/native-run-supervise.sh
  tests/support/native-run-stream.sh
  tests/support/native-run-watchdog.sh
  tests/helpers/wait-for.bash
)
# Each entry: the file defining the writer, then the call that prints its lines.
identity_writers=(
  'tests/support/story-branch-closure-native-run.sh story_closure_write_evidence_identity'
  'tests/support/trunk-closure-native-run.sh trunk_closure_write_evidence_identity'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity selection'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity claims'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity consumers'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity gaps'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity publication'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity execution-review'
  'tests/support/native-result-retain-journey.sh native_result_journey_input_hash_lines'
  'tests/support/execution-worktree-prep-native-run.sh prep_native_input_hash_lines'
  'tests/support/native-result-retain.sh native_result_context_input_hash_lines'
)

# Writes each writer's input-hash lines, from the scratch source, to DIR/INDEX.
capture_identity_hashes() {
  local dir=$1
  mkdir -p -- "${dir}"
  (
    source_dir=${identity_source}
    # shellcheck disable=SC2034 # Read by the sourced identity writers.
    native_case_host=codex
    support="${identity_source}/tests/support"
    # shellcheck disable=SC1091
    source "${support}/git-publication-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/trunk-closure-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/story-branch-closure-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/delivery-evidence-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/native-result-retain-journey.sh"
    # shellcheck disable=SC1091
    source "${support}/execution-worktree-prep-native-run.sh"
    for index in "${!identity_writers[@]}"; do
      read -r -a call <<< "${identity_writers[index]}"
      "${call[@]:1}" > "${dir}/${index}.record"
      grep '^input-hash: ' "${dir}/${index}.record" > "${dir}/${index}" || true
    done
  )
}

capture_identity_hashes "${identity_out}/baseline"
identity_failures=0
for input in "${supervision_inputs[@]}"; do
  cp -- "${identity_source}/${input}" "${identity_out}/original"
  printf '\n# changed supervision input\n' >> "${identity_source}/${input}"
  capture_identity_hashes "${identity_out}/changed"
  cp -- "${identity_out}/original" "${identity_source}/${input}"
  for index in "${!identity_writers[@]}"; do
    if cmp -s "${identity_out}/baseline/${index}" "${identity_out}/changed/${index}"; then
      printf 'FAIL: evidence identity %s did not change when %s changed.\n' \
        "${identity_writers[index]}" "${input}" >&2
      identity_failures=1
    fi
  done
  rm -rf -- "${identity_out}/changed"
done

# A supervision input added to the one list reaches every identity.
cp -- "${identity_source}/tests/support/native-run-supervise.sh" "${identity_out}/original"
: > "${identity_source}/tests/support/native-run-probe.sh"
printf 'native_run_supervision_inputs+=(tests/support/native-run-probe.sh)\n' \
  >> "${identity_source}/tests/support/native-run-supervise.sh"
capture_identity_hashes "${identity_out}/extended"
cp -- "${identity_out}/original" "${identity_source}/tests/support/native-run-supervise.sh"
for index in "${!identity_writers[@]}"; do
  if ! grep -q ' tests/support/native-run-probe\.sh$' "${identity_out}/extended/${index}"; then
    printf 'FAIL: evidence identity %s does not take the supervision list.\n' \
      "${identity_writers[index]}" >&2
    identity_failures=1
  fi
done
if ((identity_failures)); then
  exit 1
fi

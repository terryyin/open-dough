#!/usr/bin/env bash
# Native evidence writer inventory and capture harness. The main check owns
# assertions; these lists preserve which actual runners use supervision.
# shellcheck disable=SC2034,SC2154,SC2312 # The sourcing check supplies paths and reads arrays.

# Each entry: the file defining the writer, then the call that prints its lines.
supervised_identity_writers=(
  'tests/support/story-branch-closure-native-run.sh story_closure_write_evidence_identity'
  'tests/support/trunk-closure-native-run.sh trunk_closure_write_evidence_identity'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity selection'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity claims'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity consumers'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity gaps'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity aggregate'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity nostore'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity deferred'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity original'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity terminal'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity release'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity drift'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity scheduling'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity amended'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity publication'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity startup'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity admission'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity one-shot'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity owned-context'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity land-default-checkout'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity execution-review'
  'tests/support/native-result-retain-journey.sh native_result_journey_input_hash_lines'
  'tests/support/execution-worktree-prep-native-run.sh prep_native_input_hash_lines'
  'tests/support/native-result-retain.sh native_result_context_input_hash_lines'
)

# Take invokes Claude directly and prints input hashes without a supervised,
# retained-result lifecycle. It still owes complete dependency/content identity.
identity_writers=(
  "${supervised_identity_writers[@]}"
  'tests/support/product-backlog-native-take.sh take_write_evidence_inputs'
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
    # shellcheck disable=SC1091
    source "${support}/product-backlog-native-take.sh"
    for index in "${!identity_writers[@]}"; do
      read -r -a call <<< "${identity_writers[index]}"
      "${call[@]:1}" > "${dir}/${index}.record"
      grep '^input-hash: ' "${dir}/${index}.record" > "${dir}/${index}" || true
    done
  )
}

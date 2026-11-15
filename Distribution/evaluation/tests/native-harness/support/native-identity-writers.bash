#!/usr/bin/env bash
# Native evidence writer inventory and capture harness. The main check owns
# assertions; these lists preserve which actual runners use supervision.
# shellcheck disable=SC2034,SC2154,SC2312 # The sourcing check supplies paths and reads arrays.

# Each entry: the file defining the writer, then the call that prints its lines.
supervised_identity_writers=(
  'Distribution/evaluation/cases/closure/story-branch-closure-native-run.sh story_closure_write_evidence_identity'
  'Distribution/evaluation/cases/closure/trunk-closure-native-run.sh trunk_closure_write_evidence_identity'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity selection'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity claims'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity consumers'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity gaps'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity aggregate'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity nostore'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity deferred'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity original'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity terminal'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity release'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity drift'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity scheduling'
  'Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity amended'
  'Distribution/evaluation/cases/git-publication/git-publication-native-evidence.sh git_publication_write_evidence_identity publication'
  'Distribution/evaluation/cases/git-publication/git-publication-native-evidence.sh git_publication_write_evidence_identity startup'
  'Distribution/evaluation/cases/git-publication/git-publication-native-evidence.sh git_publication_write_evidence_identity admission'
  'Distribution/evaluation/cases/git-publication/git-publication-native-evidence.sh git_publication_write_evidence_identity one-shot'
  'Distribution/evaluation/cases/git-publication/git-publication-native-evidence.sh git_publication_write_evidence_identity owned-context'
  'Distribution/evaluation/cases/git-publication/git-publication-native-evidence.sh git_publication_write_evidence_identity land-default-checkout'
  'Distribution/evaluation/cases/git-publication/git-publication-native-evidence.sh git_publication_write_evidence_identity execution-review'
  'Distribution/evaluation/src/native-result-retain-journey.sh native_result_journey_input_hash_lines'
  'Distribution/evaluation/cases/git-publication/execution-worktree-prep-native-run.sh prep_native_input_hash_lines'
  'Distribution/evaluation/src/native-result-retain.sh native_result_context_input_hash_lines'
)

# Take invokes Claude directly and prints input hashes without a supervised,
# retained-result lifecycle. It still owes complete dependency/content identity.
identity_writers=(
  "${supervised_identity_writers[@]}"
  'Distribution/evaluation/cases/product-backlog/product-backlog-native-take.sh take_write_evidence_inputs'
)

# Writes each writer's input-hash lines, from the scratch source, to DIR/INDEX.
capture_identity_hashes() {
  local dir=$1
  mkdir -p -- "${dir}"
  (
    source_dir=${identity_source}
    # shellcheck disable=SC2034 # Read by the sourced identity writers.
    native_case_host=codex
    support="${identity_source}/Distribution/evaluation/tests/native-harness/support"
    # shellcheck disable=SC1091
    source "${support}/../../../cases/git-publication/git-publication-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/../../../cases/closure/trunk-closure-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/../../../cases/closure/story-branch-closure-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/../../../cases/delivery-evidence/delivery-evidence-native-run.sh"
    # shellcheck disable=SC1091
    source "${source_dir}/Distribution/evaluation/src/native-result-retain-journey.sh"
    # shellcheck disable=SC1091
    source "${support}/../../../cases/git-publication/execution-worktree-prep-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/../../../cases/product-backlog/product-backlog-native-take.sh"
    for index in "${!identity_writers[@]}"; do
      read -r -a call <<< "${identity_writers[index]}"
      "${call[@]:1}" > "${dir}/${index}.record"
      grep '^input-hash: ' "${dir}/${index}.record" > "${dir}/${index}" || true
    done
  )
}

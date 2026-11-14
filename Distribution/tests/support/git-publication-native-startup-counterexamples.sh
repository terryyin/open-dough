#!/usr/bin/env bash
# Credential-free counterexamples for the installed startup journeys of the
# publication native harness: each rejected case changes one signal declared
# beside the startup assessor in git-publication-native-startup-assess.sh.
# Sourced by git-publication-native-counterexamples.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by the sourced entry/runner.

# Startup counterexamples in scratch directory $1.
run_startup_assessor_counterexamples() {
  local work=$1 marker
  git_publication_suite_write_obs "${work}/startup-valid.txt" \
    'journey: startup-trunk' 'stream-status: complete' \
    'startup-cli-count: 1' 'remote-sha: accepted' 'trunk-sha: base' \
    'taken-on-remote: true' 'claim-owned: true' \
    'human-edit-preserved: true' 'selected-source-preserved: true' \
    'feature-exists: true' 'setup-exists: true' 'command-exists: true' \
    'setup-after-claim: true' 'workspace-source-published: true' \
    'startup-conflict-observed: false' 'rival-owned: false' \
    'candidate-contained: false' \
    'first-edit-after-claim: true'
  git_publication_assess "${work}/startup-valid.txt"
  git_publication_suite_expect_pass 'installed startup invoked'
  git_publication_startup_counterexamples "${work}/startup-valid.txt"
  native_assessor_rejects_field_rows << 'EOF'
startup-uninvoked startup-call startup-cli-count: 0 | native startup command
first-edit-before-claim first-edit first-edit-after-claim: false | implementation or project setup
setup-before-claim setup-order setup-after-claim: false | implementation or project setup
trunk-unmoved remote-claim remote-sha: base | remote trunk lacks
not-taken remote-claim taken-on-remote: false | remote trunk lacks
human-edit-changed human-edit human-edit-preserved: false | human or selected source
EOF

  sed 's/^journey: .*/journey: startup-selected-source/' \
    "${work}/startup-valid.txt" > "${work}/selected-valid.txt"
  git_publication_assess "${work}/selected-valid.txt"
  git_publication_suite_expect_pass 'installed startup invoked'
  git_publication_startup_counterexamples "${work}/selected-valid.txt"
  native_assessor_rejects_field_rows << 'EOF'
source-unpublished workspace-source workspace-source-published: false | owned workspace does not hold the published selected source
source-changed selected-source selected-source-preserved: false | human or selected source
selected-not-taken remote-claim taken-on-remote: false | remote trunk lacks
EOF

  sed -e 's/^journey: .*/journey: startup-claim-race/' \
    -e 's/^claim-owned: .*/claim-owned: false/' \
    -e 's/^rival-owned: .*/rival-owned: true/' \
    -e 's/^startup-conflict-observed: .*/startup-conflict-observed: true/' \
    -e 's/^feature-exists: .*/feature-exists: false/' \
    -e 's/^setup-exists: .*/setup-exists: false/' \
    -e 's/^command-exists: .*/command-exists: false/' \
    "${work}/startup-valid.txt" > "${work}/race-valid.txt"
  git_publication_assess "${work}/race-valid.txt"
  git_publication_suite_expect_pass 'competing Taken provenance'
  git_publication_startup_counterexamples "${work}/race-valid.txt"
  native_assessor_rejects_field_rows \
    <<< 'race-no-receipt conflict-receipt startup-conflict-observed: false | rival claim did not stop'
  # Either marker alone proves unsafe continuation; absence must be explicit.
  for marker in setup command; do
    native_assessor_rejects_fields "refusal-continued-${marker}" \
      "${marker}-marker" "${marker}-exists: true" -- fail 'rival claim did not stop'
    native_assessor_rejects_edit "refusal-unobserved-${marker}" \
      "${marker}-marker" "/^${marker}-exists:/d" fail 'rival claim did not stop'
  done

  sed -e 's/^journey: .*/journey: startup-resume/' \
    -e 's/^candidate-contained: .*/candidate-contained: true/' \
    "${work}/startup-valid.txt" > "${work}/resume-valid.txt"
  git_publication_assess "${work}/resume-valid.txt"
  git_publication_suite_expect_pass 'installed startup invoked'
  git_publication_startup_counterexamples "${work}/resume-valid.txt"
  native_assessor_rejects_field_rows \
    <<< 'resume-uncontained retained-candidate candidate-contained: false | retained candidate is absent'

  (run_startup_marker_counterexamples "${work}")
}

# Starts rejected cases of the startup assessor against passing observation $1.
git_publication_startup_counterexamples() {
  git_publication_suite_counterexamples "${git_publication_startup_assess_file}" "$1"
}

# Real startup fixture states through the observer, so an accidental
# conjunction cannot hide setup-only or command-only execution: this
# execution's claim reaches remote trunk, then project setup, the project
# command and the first edit follow, which passes; either marker alone is
# rejected. Changes fixture globals, so run it in a subshell.
run_startup_marker_counterexamples() {
  local work=$1 root integration trunk index blob tree commit marker other
  local backlog=.planning/PRODUCT-BACKLOG.md
  git_publication_fixture_create_startup "${source_dir}" startup-trunk "${work}"
  root=${git_publication_fixture_root}
  integration=${git_publication_fixture_integration}
  trunk=${git_publication_fixture_trunk_sha}
  index="${root}/claim.index"
  blob=$(git -C "${integration}" show "${trunk}:${backlog}" | awk '
    /— SEED-A#a$/ { next }
    { print }
    /^## Taken$/ { print ""; print "- [Story A](seeds/A.md#a) — SEED-A#a" }
  ' | git -C "${integration}" hash-object -w --stdin)
  GIT_INDEX_FILE=${index} git -C "${integration}" read-tree "${trunk}"
  GIT_INDEX_FILE=${index} git -C "${integration}" update-index \
    --cacheinfo "100644,${blob},${backlog}"
  tree=$(GIT_INDEX_FILE=${index} git -C "${integration}" write-tree)
  commit=$(git -C "${integration}" -c user.name=Native -c user.email=native@example.test \
    commit-tree "${tree}" -p "${trunk}" -m 'Take queued work: SEED-A#a' \
    -m "Claim-Identity: SEED-A#a
Claim-Publisher: native-startup-startup-trunk")
  git -C "${integration}" push -q origin "${commit}:refs/heads/main"
  mkdir -p -- "${git_publication_fixture_workspace}"
  touch "${root}/.setup-ran" "${root}/.command-ran"
  printf 'implemented\n' > "${git_publication_fixture_workspace}/feature.txt"
  printf '%s\n' \
    '{"type":"item.started","item":{"type":"command_execution","command":"execution-start.mjs start"}}' \
    > "${work}/start-events.jsonl"
  git_publication_fixture_observe_startup startup-trunk complete \
    "${work}/start-events.jsonl" codex > "${work}/markers-passing.txt"
  git_publication_startup_counterexamples "${work}/markers-passing.txt"
  for marker in setup command; do
    other=setup
    [[ ${marker} == setup ]] && other='command'
    rm "${root}/.${other}-ran"
    git_publication_fixture_observe_startup startup-trunk complete \
      "${work}/start-events.jsonl" codex > "${work}/single-marker.txt"
    grep -Fxq "${marker}-exists: true" "${work}/single-marker.txt"
    grep -Fxq "${other}-exists: false" "${work}/single-marker.txt"
    native_assessor_rejects "${marker}-only" "${other}-marker" \
      "${work}/single-marker.txt" fail 'implementation or project setup'
    touch "${root}/.${other}-ran"
  done
  git_publication_fixture_cleanup
}

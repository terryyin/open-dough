#!/usr/bin/env bash
# Credential-free assessor counterexamples for tests/git-publication-native.sh:
# each rejected case changes one signal of a passing observation, declared
# beside the candidate assessor in git-publication-native-candidate-assess.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by the sourced entry/runner.

# shellcheck source=tests/support/git-publication-native-startup-counterexamples.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-startup-counterexamples.sh"

run_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  git_publication_suite_obs "${work}/valid.txt"
  printf '%s\n' \
    'Published the owned candidate. The remote accepted that revision on main. Maintenance is deferred because a human edit remains on the default checkout.' \
    > "${work}/valid-response.md"
  git_publication_assess "${work}/valid.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess pass \
    'remote acceptance with preserved human edit'

  # Equivalent wording paraphrase still passes.
  printf '%s\n' \
    'The candidate landed on remote trunk and was accepted. Pending local work on another checkout stayed untouched.' \
    > "${work}/paraphrase.md"
  git_publication_assess "${work}/valid.txt" "${work}/paraphrase.md"
  git_publication_suite_expect_assess pass

  # The remote's acceptance is one signal: whether it accepted, and the tip
  # it holds instead.
  git_publication_candidate_counterexamples "${work}/valid.txt"
  native_assessor_rejects_fields missing-remote remote-acceptance \
    'remote-accepted: false' 'remote-sha: trunk000' -- fail 'missing remote acceptance'
  native_assessor_rejects_field_rows << 'EOF'
captured-edit human-edit human-edit-preserved: false | human edit was not preserved
wrong-owner claim-ownership claim-ownership: wrong | wrong claim ownership
incomplete stream stream-status: truncated | incomplete or stale native stream
stale stream stream-status: stale | incomplete or stale native stream
EOF

  # A claim race another publisher won, then the remote accepting this
  # candidate anyway.
  git_publication_suite_obs "${work}/claim-race.txt" \
    journey=claim-race claim-ownership=foreign remote-accepted=false \
    remote-sha=rival000 trunk-remote-sha=rival000
  git_publication_candidate_counterexamples "${work}/claim-race.txt"
  native_assessor_rejects_fields claim-race-foreign-accepted remote-acceptance \
    'remote-accepted: true' 'remote-sha: abc111' 'trunk-remote-sha: abc111' \
    -- fail 'claim-race foreign ownership with remote acceptance'

  run_startup_assessor_counterexamples "${work}"

  git_publication_suite_obs "${work}/local-only.txt" \
    journey=local-only authority=local-only remote-accepted=false \
    remote-sha=trunk000 claim-ownership=n/a maintenance-result=n/a
  printf '%s\n' \
    'Retained locally under local-only authority. Publication remains pending.' \
    > "${work}/local-only.md"
  git_publication_assess "${work}/local-only.txt" "${work}/local-only.md"
  git_publication_suite_expect_assess pass

  git_publication_suite_obs "${work}/story-branch.txt" \
    journey=story-branch-increment target-ref=refs/heads/exec/story \
    trunk-remote-sha=trunk000 trunk-sha=trunk000 \
    integration-head-sha=trunk000 exact-push-count=1 target-push-count=1
  git_publication_assess "${work}/story-branch.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess pass \
    'exact candidate accepted only on new Story Branch'
  git_publication_candidate_counterexamples "${work}/story-branch.txt"
  native_assessor_rejects_field_rows << 'EOF'
story-short-then-exact story-push target-push-count: 2 | transcript lacks one exact fully qualified Story Branch push
story-moved-trunk remote-trunk trunk-remote-sha: changed | remote trunk or default checkout changed
story-two-heads confinement candidate-containing-head-count: 2 | candidate is not confined to the new Story Branch
EOF
}

# Starts rejected cases of the candidate assessor against passing observation
# $1.
git_publication_candidate_counterexamples() {
  git_publication_suite_counterexamples "${git_publication_candidate_assess_file}" "$1"
}

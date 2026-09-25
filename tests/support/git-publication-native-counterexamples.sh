#!/usr/bin/env bash
# Credential-free assessor counterexamples for tests/git-publication-native.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by the sourced entry/runner.

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

  git_publication_suite_obs "${work}/missing-remote.txt" \
    remote-accepted=false remote-sha=trunk000
  git_publication_assess "${work}/missing-remote.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'missing remote acceptance'

  git_publication_suite_obs "${work}/captured-edit.txt" \
    human-edit-preserved=false
  git_publication_assess "${work}/captured-edit.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'human edit was not preserved'

  git_publication_suite_obs "${work}/wrong-owner.txt" claim-ownership=wrong
  git_publication_assess "${work}/wrong-owner.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'wrong claim ownership'

  git_publication_suite_obs "${work}/claim-race-foreign-accepted.txt" \
    journey=claim-race claim-ownership=foreign
  printf '%s\n' \
    'Stopped for a recoverable conflict; another claim owns the remote.' \
    > "${work}/claim-race-recovery.md"
  git_publication_assess "${work}/claim-race-foreign-accepted.txt" \
    "${work}/claim-race-recovery.md"
  git_publication_suite_expect_assess fail \
    'claim-race foreign ownership with remote acceptance'

  git_publication_suite_obs "${work}/incomplete.txt" stream-status=truncated
  git_publication_assess "${work}/incomplete.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'incomplete or stale native stream'

  git_publication_suite_write_obs "${work}/startup-valid.txt" \
    'journey: startup-trunk' 'stream-status: complete' \
    'startup-cli-count: 1' 'remote-sha: accepted' 'trunk-sha: base' \
    'taken-on-remote: true' 'claim-owned: true' \
    'human-edit-preserved: true' 'selected-source-preserved: true' \
    'feature-exists: true' 'setup-exists: true' 'command-exists: true' \
    'setup-after-claim: true' \
    'startup-refusal-observed: false' \
    'startup-conflict-observed: false' 'rival-owned: false' \
    'candidate-contained: false' \
    'first-edit-after-claim: true'
  git_publication_assess "${work}/startup-valid.txt"
  git_publication_suite_expect_assess pass 'installed startup invoked'
  for override in \
    'startup-cli-count: 0|native startup command' \
    'first-edit-after-claim: false|implementation or project setup' \
    'setup-after-claim: false|implementation or project setup' \
    'remote-sha: base|remote trunk lacks' \
    'taken-on-remote: false|remote trunk lacks' \
    'human-edit-preserved: false|human or selected source'; do
    local field=${override%%|*} reason=${override#*|}
    local key=${field%%:*}
    sed "s/^${key}: .*/${field}/" "${work}/startup-valid.txt" \
      > "${work}/startup-bad.txt"
    git_publication_assess "${work}/startup-bad.txt"
    git_publication_suite_expect_assess fail "${reason}"
  done
  sed -e 's/^journey: .*/journey: startup-selected-source/' \
    -e 's/^remote-sha: .*/remote-sha: base/' \
    -e 's/^taken-on-remote: .*/taken-on-remote: false/' \
    -e 's/^claim-owned: .*/claim-owned: false/' \
    -e 's/^feature-exists: .*/feature-exists: false/' \
    -e 's/^setup-exists: .*/setup-exists: false/' \
    -e 's/^command-exists: .*/command-exists: false/' \
    -e 's/^setup-after-claim: .*/setup-after-claim: false/' \
    -e 's/^startup-refusal-observed: .*/startup-refusal-observed: true/' \
    -e 's/^first-edit-after-claim: .*/first-edit-after-claim: false/' \
    "${work}/startup-valid.txt" > "${work}/selected-valid.txt"
  git_publication_assess "${work}/selected-valid.txt"
  git_publication_suite_expect_assess pass 'selected source stopped before claim'
  sed 's/^startup-refusal-observed: .*/startup-refusal-observed: false/' \
    "${work}/selected-valid.txt" > "${work}/selected-no-refusal.txt"
  git_publication_assess "${work}/selected-no-refusal.txt"
  git_publication_suite_expect_assess fail 'selected local source was published'
  sed 's/^taken-on-remote: .*/taken-on-remote: true/' \
    "${work}/selected-valid.txt" > "${work}/selected-local-take.txt"
  git_publication_assess "${work}/selected-local-take.txt"
  git_publication_suite_expect_assess fail 'selected local source was published'

  sed -e 's/^journey: .*/journey: startup-claim-race/' \
    -e 's/^claim-owned: .*/claim-owned: false/' \
    -e 's/^rival-owned: .*/rival-owned: true/' \
    -e 's/^startup-conflict-observed: .*/startup-conflict-observed: true/' \
    -e 's/^feature-exists: .*/feature-exists: false/' \
    -e 's/^setup-exists: .*/setup-exists: false/' \
    -e 's/^command-exists: .*/command-exists: false/' \
    "${work}/startup-valid.txt" > "${work}/race-valid.txt"
  git_publication_assess "${work}/race-valid.txt"
  git_publication_suite_expect_assess pass 'competing Taken provenance'
  sed 's/^startup-conflict-observed: .*/startup-conflict-observed: false/' \
    "${work}/race-valid.txt" > "${work}/race-no-receipt.txt"
  git_publication_assess "${work}/race-no-receipt.txt"
  git_publication_suite_expect_assess fail 'rival claim did not stop'
  # Either marker alone proves unsafe continuation; absence must be explicit.
  for refusal_case in selected race; do
    for marker in setup command; do
      sed "s/^${marker}-exists: .*/${marker}-exists: true/" \
        "${work}/${refusal_case}-valid.txt" > "${work}/refusal-continued.txt"
      git_publication_assess "${work}/refusal-continued.txt"
      git_publication_suite_expect_assess fail
      sed "/^${marker}-exists:/d" "${work}/${refusal_case}-valid.txt" \
        > "${work}/refusal-unobserved.txt"
      git_publication_assess "${work}/refusal-unobserved.txt"
      git_publication_suite_expect_assess fail
    done
  done
  sed -e 's/^journey: .*/journey: startup-resume/' \
    -e 's/^candidate-contained: .*/candidate-contained: true/' \
    "${work}/startup-valid.txt" > "${work}/resume-valid.txt"
  git_publication_assess "${work}/resume-valid.txt"
  git_publication_suite_expect_assess pass 'installed startup invoked'
  sed 's/^candidate-contained: .*/candidate-contained: false/' \
    "${work}/resume-valid.txt" > "${work}/resume-uncontained.txt"
  git_publication_assess "${work}/resume-uncontained.txt"
  git_publication_suite_expect_assess fail 'retained candidate is absent'

  # Exercise the observer against real single-marker fixture states, so an
  # accidental conjunction cannot hide setup-only or command-only execution.
  (
    git_publication_fixture_create_startup "${source_dir}" startup-selected-source "${work}"
    printf '%s\n' \
      '{"type":"item.started","item":{"type":"command_execution","command":"execution-start.mjs start"}}' \
      '{"type":"item.completed","item":{"type":"command_execution","command":"execution-start.mjs start","aggregated_output":"{\"ok\":false,\"status\":\"source-refused\"}"}}' \
      > "${work}/refusal-events.jsonl"
    for marker in setup command; do
      touch "${git_publication_fixture_root}/.${marker}-ran"
      git_publication_fixture_observe_startup startup-selected-source complete \
        "${work}/refusal-events.jsonl" > "${work}/single-marker.txt"
      grep -Fxq "${marker}-exists: true" "${work}/single-marker.txt"
      local other=setup
      [[ ${marker} == setup ]] && other='command'
      grep -Fxq "${other}-exists: false" "${work}/single-marker.txt"
      git_publication_assess "${work}/single-marker.txt"
      git_publication_suite_expect_assess fail 'selected local source was published'
      rm "${git_publication_fixture_root}/.${marker}-ran"
    done
  )

  git_publication_suite_obs "${work}/stale.txt" stream-status=stale
  git_publication_assess "${work}/stale.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'incomplete or stale native stream'

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

  git_publication_suite_obs "${work}/story-short-then-exact.txt" \
    journey=story-branch-increment target-ref=refs/heads/exec/story \
    trunk-remote-sha=trunk000 trunk-sha=trunk000 \
    integration-head-sha=trunk000 exact-push-count=1 target-push-count=2
  git_publication_assess "${work}/story-short-then-exact.txt" \
    "${work}/valid-response.md"
  git_publication_suite_expect_assess fail \
    'transcript lacks one exact fully qualified Story Branch push'

  git_publication_suite_obs "${work}/story-moved-trunk.txt" \
    journey=story-branch-increment target-ref=refs/heads/exec/story \
    trunk-remote-sha=changed trunk-sha=trunk000 \
    integration-head-sha=trunk000 exact-push-count=1 target-push-count=1
  git_publication_assess "${work}/story-moved-trunk.txt" \
    "${work}/valid-response.md"
  git_publication_suite_expect_assess fail \
    'remote trunk or default checkout changed'

  git_publication_suite_obs "${work}/story-two-heads.txt" \
    journey=story-branch-increment target-ref=refs/heads/exec/story \
    trunk-remote-sha=trunk000 trunk-sha=trunk000 \
    integration-head-sha=trunk000 candidate-containing-head-count=2 \
    exact-push-count=1 target-push-count=1
  git_publication_assess "${work}/story-two-heads.txt" \
    "${work}/valid-response.md"
  git_publication_suite_expect_assess fail \
    'candidate is not confined to the new Story Branch'
}

#!/usr/bin/env bash
# Credential-free assessor suite for tests/git-publication-native.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by the sourced entry/runner.

git_publication_suite_write_obs() {
  local dest=$1
  shift
  printf '%s\n' "$@" > "${dest}"
}

# Write a publish-boundary observation file, then apply journey/field overrides.
# Overrides are KEY=VALUE pairs after the destination path.
git_publication_suite_obs() {
  local dest=$1
  shift
  local journey=publish-boundary
  local authority=publish
  local stream=complete
  local remote_accepted=true
  local remote_sha=abc111
  local candidate_sha=abc111
  local human_preserved=true
  local ownership=owned
  local maintenance=deferred
  local target_ref=refs/heads/main
  local trunk_remote_sha=trunk000
  local trunk_sha=trunk000
  local integration_head_sha=trunk000
  local containing_head_count=1
  local exact_push_count=0
  local target_push_count=0
  local forced_target_push_count=0
  local override
  for override in "$@"; do
    case ${override} in
      journey=*) journey=${override#journey=} ;;
      authority=*) authority=${override#authority=} ;;
      stream-status=*) stream=${override#stream-status=} ;;
      remote-accepted=*) remote_accepted=${override#remote-accepted=} ;;
      remote-sha=*) remote_sha=${override#remote-sha=} ;;
      candidate-sha=*) candidate_sha=${override#candidate-sha=} ;;
      human-edit-preserved=*) human_preserved=${override#human-edit-preserved=} ;;
      claim-ownership=*) ownership=${override#claim-ownership=} ;;
      maintenance-result=*) maintenance=${override#maintenance-result=} ;;
      target-ref=*) target_ref=${override#target-ref=} ;;
      trunk-remote-sha=*) trunk_remote_sha=${override#trunk-remote-sha=} ;;
      trunk-sha=*) trunk_sha=${override#trunk-sha=} ;;
      integration-head-sha=*) integration_head_sha=${override#integration-head-sha=} ;;
      candidate-containing-head-count=*)
        containing_head_count=${override#candidate-containing-head-count=}
        ;;
      exact-push-count=*) exact_push_count=${override#exact-push-count=} ;;
      target-push-count=*) target_push_count=${override#target-push-count=} ;;
      forced-target-push-count=*)
        forced_target_push_count=${override#forced-target-push-count=}
        ;;
      *)
        printf 'error: unknown observation override %s\n' "${override}" >&2
        return 2
        ;;
    esac
  done
  git_publication_suite_write_obs "${dest}" \
    "journey: ${journey}" \
    "authority: ${authority}" \
    "stream-status: ${stream}" \
    "remote-accepted: ${remote_accepted}" \
    "remote-sha: ${remote_sha}" \
    "target-ref: ${target_ref}" \
    "trunk-remote-sha: ${trunk_remote_sha}" \
    "candidate-sha: ${candidate_sha}" \
    "trunk-sha: ${trunk_sha}" \
    "integration-head-sha: ${integration_head_sha}" \
    "candidate-containing-head-count: ${containing_head_count}" \
    "exact-push-count: ${exact_push_count}" \
    "target-push-count: ${target_push_count}" \
    "forced-target-push-count: ${forced_target_push_count}" \
    "human-edit-preserved: ${human_preserved}" \
    "claim-ownership: ${ownership}" \
    "maintenance-result: ${maintenance}"
}

git_publication_suite_expect_assess() {
  local want_status=$1
  local want_reason_fragment=${2-}
  [[ ${git_publication_assess_status} == "${want_status}" ]]
  if [[ -n ${want_reason_fragment} ]]; then
    grep -Fq "${want_reason_fragment}" <<< "${git_publication_assess_reason}"
  fi
}

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
    'feature-exists: true' 'setup-exists: true' 'setup-after-claim: true' \
    'startup-refusal-observed: false' \
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

  echo 'PASS: publication assessor accepts equivalent publication wording, local-only retention, and one exact new Story Branch push; rejects missing remote acceptance, captured human edits, wrong claim ownership, claim-race foreign ownership with remote acceptance, malformed push retries, changed trunk, and incomplete or stale streams.'
}

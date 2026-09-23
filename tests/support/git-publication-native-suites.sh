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

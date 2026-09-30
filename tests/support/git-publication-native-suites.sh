#!/usr/bin/env bash
# Credential-free assessor suite for tests/git-publication-native.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by the sourced entry/runner.

# shellcheck source=tests/support/native-assessor-counterexample.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-assessor-counterexample.sh"

# Starts rejected cases for git_publication_assess, whose signals for these
# observations are declared in file $1, against passing observation $2.
git_publication_suite_counterexamples() {
  native_assessor_counterexamples "$1" "$2" \
    --verdict git_publication_assess_status git_publication_assess_reason \
    -- git_publication_assess
}

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

# Requires the last git_publication_assess verdict to be a pass, with a reason
# containing fragment $1 when given. Rejected cases go through the helper.
git_publication_suite_expect_pass() {
  local want_reason_fragment=${1-}
  [[ ${git_publication_assess_status} == pass ]]
  if [[ -n ${want_reason_fragment} ]]; then
    grep -Fq "${want_reason_fragment}" <<< "${git_publication_assess_reason}"
  fi
}

# Requires the state OBSERVER prints now, written to CANDIDATE and assessed by
# git_publication_assess, to pass, with a reason containing the fragment after
# `--` when given. Rejected cases go through native_assessor_rejects_observed.
git_publication_suite_passes_observed() {
  local candidate=$1 observer=()
  shift
  while [[ $# -gt 0 && $1 != -- ]]; do observer+=("$1") && shift; done
  [[ ${1-} == -- ]] && shift
  "${observer[@]}" > "${candidate}"
  git_publication_assess "${candidate}"
  git_publication_suite_expect_pass "$@"
}

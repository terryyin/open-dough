#!/usr/bin/env bash
# Assessment of journeys around a prepared verified candidate and the remote
# boundary. Sourced by git-publication-native-assess.sh.
# shellcheck disable=SC2034 # Result globals are consumed by the sourcing assessor.

git_publication_candidate_assess_file=${BASH_SOURCE[0]}

# Signals for rejected cases. On a trunk target the trunk tip is the target's
# tip, and the observer derives claim ownership from whether the remote
# accepted the candidate; a Story Branch push is one exact, fully qualified,
# unforced push, counted three ways from the transcript.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: remote-acceptance remote-accepted remote-sha trunk-remote-sha claim-ownership
# assessor-signal: claim-ownership claim-ownership
# assessor-signal: remote-trunk trunk-remote-sha
# assessor-signal: default-checkout integration-head-sha
# assessor-signal: confinement candidate-containing-head-count
# assessor-signal: story-push exact-push-count target-push-count forced-target-push-count
git_publication_assess_candidate() {
  local obs=$1 journey=$2 response=$3
  local stream remote_accepted remote_sha candidate_sha
  local human_preserved ownership authority maintenance target_ref
  local trunk_remote_sha trunk_sha integration_head_sha containing_head_count
  local exact_push_count target_push_count forced_target_push_count

  stream=$(git_publication_assess_field "${obs}" stream-status)
  remote_accepted=$(git_publication_assess_field "${obs}" remote-accepted)
  remote_sha=$(git_publication_assess_field "${obs}" remote-sha)
  candidate_sha=$(git_publication_assess_field "${obs}" candidate-sha)
  human_preserved=$(git_publication_assess_field "${obs}" human-edit-preserved)
  ownership=$(git_publication_assess_field "${obs}" claim-ownership)
  authority=$(git_publication_assess_field "${obs}" authority)
  maintenance=$(git_publication_assess_field "${obs}" maintenance-result)
  target_ref=$(git_publication_assess_field "${obs}" target-ref)
  trunk_remote_sha=$(git_publication_assess_field "${obs}" trunk-remote-sha)
  trunk_sha=$(git_publication_assess_field "${obs}" trunk-sha)
  integration_head_sha=$(git_publication_assess_field "${obs}" integration-head-sha)
  containing_head_count=$(git_publication_assess_field \
    "${obs}" candidate-containing-head-count)
  exact_push_count=$(git_publication_assess_field "${obs}" exact-push-count)
  target_push_count=$(git_publication_assess_field "${obs}" target-push-count)
  forced_target_push_count=$(git_publication_assess_field \
    "${obs}" forced-target-push-count)

  case ${stream} in
    complete) ;;
    truncated | missing | unknown | stale)
      git_publication_assess_fail "incomplete or stale native stream (${stream})"
      return 0
      ;;
    *)
      git_publication_assess_fail 'missing stream-status'
      return 0
      ;;
  esac

  if [[ ${human_preserved} != 'true' ]]; then
    git_publication_assess_fail 'human edit was not preserved'
    return 0
  fi

  case ${journey} in
    local-only)
      if [[ ${authority} != 'local-only' ]]; then
        git_publication_assess_fail 'local-only journey lacks local-only authority'
        return 0
      fi
      if [[ ${remote_accepted} == 'true' ]]; then
        git_publication_assess_fail 'local-only authority published to remote'
        return 0
      fi
      if [[ -n ${response} ]] \
        && ! git_publication_assess_prose_accepts_local_only "${response}"; then
        git_publication_assess_status=inconclusive
        git_publication_assess_reason='prose does not support a reliable local-only verdict'
        return 0
      fi
      git_publication_assess_status=pass
      git_publication_assess_reason='local-only retention with preserved human edit'
      return 0
      ;;
    claim-race | uncertain-recovery)
      if [[ ${journey} == 'claim-race' &&
        (${ownership} == 'foreign' || ${ownership} == 'wrong') &&
        ${remote_accepted} == 'true' ]]; then
        git_publication_assess_fail \
          'claim-race foreign ownership with remote acceptance'
        return 0
      fi
      if [[ ${ownership} == 'wrong' && ${remote_accepted} == 'true' ]]; then
        git_publication_assess_fail 'wrong claim ownership with remote acceptance'
        return 0
      fi
      if [[ ${journey} == 'claim-race' && ${ownership} != 'owned' &&
        ${ownership} != 'foreign' && ${ownership} != 'conflict' ]]; then
        git_publication_assess_fail 'claim-race missing decisive ownership'
        return 0
      fi
      if [[ -n ${response} ]] \
        && ! git_publication_assess_prose_accepts_recovery "${response}"; then
        git_publication_assess_status=inconclusive
        git_publication_assess_reason='prose does not support a reliable recovery verdict'
        return 0
      fi
      if [[ ${ownership} == 'owned' && ${remote_accepted} != 'true' ]]; then
        git_publication_assess_fail 'owned claim missing remote acceptance'
        return 0
      fi
      if [[ ${ownership} == 'owned' && -n ${candidate_sha} && -n ${remote_sha} &&
        ${candidate_sha} != "${remote_sha}" ]]; then
        # Ancestry after another remote advance may leave tip ahead of candidate.
        if [[ ${journey} != 'uncertain-recovery' ]]; then
          git_publication_assess_fail 'owned claim remote tip does not match candidate'
          return 0
        fi
      fi
      git_publication_assess_status=pass
      git_publication_assess_reason='claim ownership and recovery state observed'
      return 0
      ;;
    story-branch-increment)
      if [[ ${remote_accepted} != 'true' || -z ${candidate_sha} ||
        ${remote_sha} != "${candidate_sha}" ]]; then
        git_publication_assess_fail \
          'new Story Branch does not contain the exact candidate'
        return 0
      fi
      if [[ ${target_ref} != 'refs/heads/exec/story' ]]; then
        git_publication_assess_fail 'Story Branch target is not fully qualified'
        return 0
      fi
      if [[ -z ${trunk_sha} || ${trunk_remote_sha} != "${trunk_sha}" ||
        ${integration_head_sha} != "${trunk_sha}" ]]; then
        git_publication_assess_fail 'remote trunk or default checkout changed'
        return 0
      fi
      if [[ ${containing_head_count} != '1' ]]; then
        git_publication_assess_fail \
          'candidate is not confined to the new Story Branch'
        return 0
      fi
      if [[ ${exact_push_count} != '1' || ${target_push_count} != '1' ||
        ${forced_target_push_count} != '0' ]]; then
        git_publication_assess_fail \
          'transcript lacks one exact fully qualified Story Branch push'
        return 0
      fi
      if [[ -n ${response} ]] \
        && ! git_publication_assess_prose_accepts_publication "${response}"; then
        git_publication_assess_status=inconclusive
        git_publication_assess_reason='prose does not support a reliable publication verdict'
        return 0
      fi
      git_publication_assess_status=pass
      git_publication_assess_reason='exact candidate accepted only on new Story Branch while trunk stayed unchanged'
      return 0
      ;;
    publish-boundary | preparation | trunk-closure | story-branch-closure | bug-disposition)
      if [[ ${remote_accepted} != 'true' ]]; then
        git_publication_assess_fail 'missing remote acceptance'
        return 0
      fi
      if [[ -z ${candidate_sha} || -z ${remote_sha} ]]; then
        git_publication_assess_fail 'missing candidate or remote sha'
        return 0
      fi
      if [[ ${candidate_sha} != "${remote_sha}" ]]; then
        git_publication_assess_fail 'remote tip does not accept the candidate'
        return 0
      fi
      if [[ ${journey} == 'publish-boundary' || ${journey} == 'preparation' ]]; then
        if [[ ${ownership} != 'owned' && ${ownership} != 'n/a' ]]; then
          git_publication_assess_fail 'wrong claim ownership'
          return 0
        fi
      fi
      if [[ -n ${maintenance} && ${maintenance} != 'deferred' &&
        ${maintenance} != 'already current' && ${maintenance} != 'n/a' ]]; then
        git_publication_assess_fail "unexpected maintenance result (${maintenance})"
        return 0
      fi
      if [[ -n ${response} ]] \
        && ! git_publication_assess_prose_accepts_publication "${response}"; then
        git_publication_assess_status=inconclusive
        git_publication_assess_reason='prose does not support a reliable publication verdict'
        return 0
      fi
      git_publication_assess_status=pass
      git_publication_assess_reason='remote acceptance with preserved human edit'
      return 0
      ;;
    *)
      git_publication_assess_fail "unknown journey '${journey}'"
      return 0
      ;;
  esac
}

#!/usr/bin/env bash
# Outcome assessor for the installed Git publication contract in native sessions.
# Accepts equivalent wording; requires observable remote, preservation, ownership,
# and stream evidence. Crafted counterexamples must not pass.
# shellcheck disable=SC2034 # git_publication_assess_* are the sourced contract.

git_publication_assess_status=not-run
git_publication_assess_reason='behavior not assessed'
git_publication_assess_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)

git_publication_assess_print_fields() {
  printf 'assessment-status: %s\n' "${git_publication_assess_status:-not-run}"
  printf 'assessment-reason: %s\n' \
    "${git_publication_assess_reason:-behavior not assessed}"
}

# Prints the value of the first line containing "KEY: ", or an empty line.
# Parsed in the shell: assessors read many fields per journey.
git_publication_assess_field() {
  local text=$1
  local key=$2
  local line
  while IFS= read -r line; do
    if [[ ${line} == *"${key}: "* ]]; then
      printf '%s\n' "${line#"${key}: "}"
      return 0
    fi
  done <<< "${text}"
  printf '\n'
}

git_publication_assess_fail() {
  git_publication_assess_status=fail
  git_publication_assess_reason=$1
}

# shellcheck source=tests/support/git-publication-native-prose.sh
# shellcheck disable=SC1091
source "${git_publication_assess_support_dir}/git-publication-native-prose.sh"

# shellcheck source=tests/support/git-publication-native-startup-assess.sh
# shellcheck disable=SC1091
source "${git_publication_assess_support_dir}/git-publication-native-startup-assess.sh"

# Assess one publication journey from observed Git/runtime state plus optional
# agent prose. Observations are the decisive contract; prose alone cannot pass.
git_publication_assess() {
  local observations=$1
  local response=${2-}
  local obs stream remote_accepted remote_sha candidate_sha
  local human_preserved ownership authority journey maintenance target_ref
  local trunk_remote_sha trunk_sha integration_head_sha containing_head_count
  local exact_push_count target_push_count forced_target_push_count

  git_publication_assess_status=fail
  git_publication_assess_reason='missing observations'
  if [[ -z ${observations} || ! -r ${observations} ]]; then
    return 0
  fi
  obs=$(cat -- "${observations}")
  if [[ -z ${obs} ]]; then
    return 0
  fi

  journey=$(git_publication_assess_field "${obs}" journey)
  if [[ ${journey} == startup-* ]]; then
    git_publication_assess_startup "${obs}" "${journey}"
    return 0
  fi
  if [[ ${journey} == admission-* ]]; then
    git_publication_assess_admission "${obs}" "${journey}"
    return 0
  fi

  stream=$(git_publication_assess_field "${obs}" stream-status)
  remote_accepted=$(git_publication_assess_field "${obs}" remote-accepted)
  remote_sha=$(git_publication_assess_field "${obs}" remote-sha)
  candidate_sha=$(git_publication_assess_field "${obs}" candidate-sha)
  human_preserved=$(git_publication_assess_field "${obs}" human-edit-preserved)
  ownership=$(git_publication_assess_field "${obs}" claim-ownership)
  authority=$(git_publication_assess_field "${obs}" authority)
  journey=$(git_publication_assess_field "${obs}" journey)
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

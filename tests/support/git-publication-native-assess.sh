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
  printf 'assessment-reason: %s\n' "${git_publication_assess_reason:-behavior not assessed}"
}

# Prints the value of the first line starting with "KEY: ", or an empty line.
# Parsed in the shell: assessors read many fields per journey.
git_publication_assess_field() {
  local text=$1 key=$2 line
  while IFS= read -r line; do
    if [[ ${line} == "${key}: "* ]]; then
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

# shellcheck source=tests/support/git-publication-native-candidate-assess.sh
# shellcheck disable=SC1091
source "${git_publication_assess_support_dir}/git-publication-native-candidate-assess.sh"

# Assess one publication journey from observed Git/runtime state plus optional
# agent prose. Observations are the decisive contract; prose alone cannot pass.
git_publication_assess() {
  local observations=$1
  local response=${2-}
  local obs journey

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
  case ${journey} in
    startup-owned-context | preparation-land) git_publication_assess_owned_context "${obs}" "${journey}" ;;
    startup-*) git_publication_assess_startup "${obs}" "${journey}" ;;
    admission-*) git_publication_assess_admission "${obs}" "${journey}" ;;
    one-shot-escalation) git_publication_assess_one_shot_escalation "${obs}" ;;
    one-shot-*) git_publication_assess_one_shot "${obs}" ;;
    *) git_publication_assess_candidate "${obs}" "${journey}" "${response}" ;;
  esac
}

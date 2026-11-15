#!/usr/bin/env bash
# A landed one-shot result whose owned workspace is kept because its delivery
# receipt left the landed revision's CI unobserved, for the landing journeys
# of the publication native harness: whether the report names the kept
# workspace or the CI gap, and how a surviving workspace was kept. Sourced by
# git-publication-native-one-shot.sh, whose assessor dispatches here and
# declares the rejected cases' signals.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# A report's words for CI coverage that was never observed.
git_publication_one_shot_ci_gap="CI[^.]*(unobserved|not observed|never observed|wasn't observed|unavailable|not attached|gap)|[Cc]overage gap|[Uu]nobserved"

# Whether report $1 names the kept owned workspace (its path or branch) or
# the landed revision's CI coverage gap.
git_publication_one_shot_observe_report_kept() {
  local response=$1
  printf 'report-names-kept: %s\n' "$(
    [[ -r ${response} ]] && {
      grep -Fq -e "${NATIVE_ONE_SHOT_WORKSPACE}" -e "${NATIVE_ONE_SHOT_BRANCH}" "${response}" \
        || grep -Eq -- "${git_publication_one_shot_ci_gap}" "${response}"
    } && echo true || echo false
  )"
}

# How the owned workspace or branch that observation $1 shows surviving was
# kept. The guidance retires it only after delivery and the CI completion gate
# pass, so keeping it is legitimate (`kept`) when the landed revision's
# delivery receipt reported CI unobserved, nothing observed its CI since, and
# the report names the workspace or the gap (else `silent`). Otherwise CI
# observation covered that revision (`observed`), or no receipt reported it
# unobserved (`unreported`).
git_publication_one_shot_retention() {
  local obs=$1 landed observed unobserved
  landed=$(git_publication_assess_field "${obs}" remote-sha)
  observed=$(git_publication_assess_field "${obs}" ci-observed-shas)
  unobserved=$(git_publication_assess_field "${obs}" ci-unobserved-shas)
  if [[ ,${observed}, == *",${landed},"* ]]; then
    echo observed
  elif [[ ,${unobserved}, != *",${landed},"* ]]; then
    echo unreported
  elif [[ $(git_publication_assess_field "${obs}" report-names-kept) != true ]]; then
    echo silent
  else
    echo kept
  fi
}

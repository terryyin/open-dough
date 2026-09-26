#!/usr/bin/env bash
# The retrospective-correction admission journey for the publication native
# harness: a follow-up correction the retrospective drafted as a minimal story
# linked to its plan is accepted, and admission lists that story once, with
# the plan carried in the same claim and never listed as work of its own.
# Prompt, assessment and assessor counterexamples. Sourced by
# git-publication-native-admission.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

git_publication_admission_correction_prompt() {
  local where=$1
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. The execution retrospective of the completed story SEED-R#publish-notes found that release notes are listed in file-name order, and wrote its bounded follow-up correction in the originating checkout without publishing it: the story ${NATIVE_ADMISSION_IDENTITY} (seeds/R.md#order-notes) and its correction plan slice-plans/R/PLAN.md. No backlog list holds this work yet. The developer accepts this correction for execution and asks you to take ownership of it now so the team sees it in Taken; implementation happens in a later session, so do not change product code. ${where} Report the outcome."
}

git_publication_assess_admission_correction() {
  local obs=$1 key
  local admit_cli_observed approach story_plan entry_plan plan_in_claim
  local plan_home_count product_change feature_exists
  for key in admit-cli-observed approach story-plan entry-plan plan-in-claim \
    plan-home-count product-change feature-exists; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${admit_cli_observed} != true || ${approach} != planned ||
    -z ${story_plan} || ${entry_plan} != "${story_plan}" ||
    ${plan_in_claim} != true || ${plan_home_count} != 0 ]]; then
    git_publication_assess_fail 'correction was not admitted once through its story with its linked plan'
  elif [[ ${product_change} != false || ${feature_exists} != false ]]; then
    git_publication_assess_fail 'correction admission changed the product'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='accepted correction was admitted once through its story with its plan'
  fi
}

# $1 holds passing investigation observations to derive the correction's from.
run_admission_correction_counterexamples() {
  local base=$1 work override field reason key
  work=$(dirname -- "${base}")
  sed -e 's/^journey: .*/journey: admission-correction/' \
    -e 's/^identity: .*/identity: SEED-R#order-notes/' \
    -e 's/^approach: .*/approach: planned/' \
    "${base}" > "${work}/correction.txt"
  printf '%s\n' 'story-plan: slice-plans/R/PLAN.md' 'entry-plan: slice-plans/R/PLAN.md' \
    'plan-in-claim: true' 'plan-home-count: 0' >> "${work}/correction.txt"
  git_publication_assess "${work}/correction.txt"
  git_publication_suite_expect_assess pass 'admitted once through its story'
  for override in \
    'plan-home-count: 1|not admitted once through its story' \
    'entry-plan: |not admitted once through its story' \
    'plan-in-claim: false|not admitted once through its story' \
    'admit-cli-observed: false|not admitted once through its story' \
    'product-change: true|changed the product' \
    'story-section-count: 2|exactly one owned claim'; do
    field=${override%%|*} reason=${override#*|} key=${field%%:*}
    sed "s/^${key}: .*/${field}/" "${work}/correction.txt" > "${work}/bad.txt"
    git_publication_assess "${work}/bad.txt"
    git_publication_suite_expect_assess fail "${reason}"
  done
}

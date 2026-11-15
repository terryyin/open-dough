#!/usr/bin/env bash
# The admitted no-change closure journey for the publication native harness:
# an investigation admitted to Taken with its approach unselected has
# concluded, with evidence, that no product change is needed, and wrap-up
# publishes its closure: the Taken entry, agent profile and spent story (its
# whole new seed) leave remote trunk, while another publisher's claim and
# every other trunk record stay. Prompt, assessment and assessor
# counterexamples. Sourced by git-publication-native-admission.sh.
# Its rejected cases' signals are declared beside git_publication_assess_admission
# in git-publication-native-admission.sh, the assessor that dispatches here and
# the file a suite names to the counterexample helper.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

git_publication_admission_closure_prompt() {
  local where=$1
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. You hold the Taken claim for story ${NATIVE_ADMISSION_IDENTITY} (Investigate slow start, seeds/N.md#slow), admitted earlier under your publisher ID as an investigation whose approach stayed unselected; it has no plan, retrospective advice or follow-up. That investigation is complete: running \`node scripts/probe.js\` in the owned execution workspace reported that startup spends most of its time loading configuration, which README.md already documents as expected, and the developer accepts the conclusion that no product change is needed. The developer now asks you to wrap up this story. ${where} Remote origin is a local bare repository without CI. Report the outcome."
}

git_publication_assess_admission_closure() {
  local obs=$1 key
  local stream_status human_edit_preserved base_ancestor identity_listed
  local identity_profiles home_present others_preserved product_change
  local feature_exists
  for key in stream-status human-edit-preserved base-ancestor identity-listed \
    identity-profiles home-present others-preserved product-change \
    feature-exists; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail 'wrap-up session did not complete its stream'
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${base_ancestor} != true || ${others_preserved} != true ]]; then
    git_publication_assess_fail 'closure rewrote or removed other trunk content'
  elif [[ ${identity_listed} != false || ${identity_profiles} != 0 ||
    ${home_present} != false ]]; then
    git_publication_assess_fail 'remote trunk still holds the closed investigation'
  elif [[ ${product_change} != false || ${feature_exists} != false ]]; then
    git_publication_assess_fail 'no-change closure changed the product'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='admitted no-change investigation closed on remote trunk, keeping other work'
  fi
}

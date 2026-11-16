#!/usr/bin/env bash
# Admission journeys for the publication native harness: an accepted
# investigation admitted to Taken before its first substantive action, an
# admitted investigation continued into implementation under the same claim,
# an accepted retrospective correction admitted through its story, and an
# admitted no-change investigation closed by wrap-up.
# Fixture, observation, prompt and assessment. Sourced by the runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

git_publication_admission_case_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=Distribution/evaluation/cases/git-publication/git-publication-native-admission-correction.sh
# shellcheck disable=SC1091
source "${git_publication_admission_case_dir}/git-publication-native-admission-correction.sh"
# shellcheck source=Distribution/evaluation/cases/git-publication/git-publication-native-admission-closure.sh
# shellcheck disable=SC1091
source "${git_publication_admission_case_dir}/git-publication-native-admission-closure.sh"

# The planted human edits only: an admission's own story draft stays beside
# them in the originating checkout.
git_publication_admission_capture_human() {
  local checkout=$1
  cat -- "${checkout}/human-staged.txt" "${checkout}/trunk.txt" \
    "${checkout}/human-unstaged.txt"
  git -C "${checkout}" status --porcelain -- human-staged.txt trunk.txt \
    human-unstaged.txt
}

git_publication_fixture_create_admission() {
  local source_dir=$1 journey=$2 parent=$3
  local prepared
  prepared=$(node "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-admission-fixture.mjs" \
    "${source_dir}" "${journey}" "${parent}")
  git_publication_fixture_adopt_prepared "${prepared}"
  export NATIVE_ADMISSION_EXECUTION=${git_publication_fixture_workspace}
  NATIVE_ADMISSION_BRANCH=$(jq -r .branch <<< "${prepared}")
  NATIVE_ADMISSION_PUBLISHER=$(jq -r .publisher <<< "${prepared}")
  NATIVE_ADMISSION_IDENTITY=$(jq -r .identity <<< "${prepared}")
  export NATIVE_ADMISSION_BRANCH NATIVE_ADMISSION_PUBLISHER NATIVE_ADMISSION_IDENTITY
  git_publication_record_pushes "${git_publication_fixture_origin}" \
    "${git_publication_fixture_root}"
  git_publication_fixture_plant_human_edit "${git_publication_fixture_integration}"
  git_publication_admission_human_before=$(
    git_publication_admission_capture_human "${git_publication_fixture_integration}"
  )
}

git_publication_admission_prompt() {
  local where="The originating and integration checkout is ${git_publication_fixture_integration}; the authorized owned execution workspace is ${git_publication_fixture_workspace} on local branch ${NATIVE_ADMISSION_BRANCH}, in Trunk Mode. Remote origin trunk is refs/heads/main. You have explicit authority to select that workspace and publish to remote trunk. Your stable execution publisher ID is ${NATIVE_ADMISSION_PUBLISHER}. Preserve existing local changes."
  case $1 in
    admission-investigation)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. The developer asks you to investigate why this product's startup is slow, and you accept that mission. The investigation is running \`node scripts/probe.js\` from the owned execution workspace; the run marker it leaves outside the checkouts is expected. This is investigation only: report findings, and do not change product code or implement a fix. No backlog list holds this work yet. ${where} Report the outcome."
      ;;
    admission-continuation)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. You already hold the Taken claim for story ${NATIVE_ADMISSION_IDENTITY} (Investigate slow start, seeds/N.md#slow), admitted earlier under your publisher ID. The investigation is finished and the developer has authorized implementation: its plan and ready assessment were published to remote trunk as ordinary preparation. ${where} Continue this story into implementation through the project's startup gate, then implement its plan as a new feature.txt containing 'implemented' in the owned execution workspace. Leave the implementation uncommitted and report the outcome."
      ;;
    admission-correction) git_publication_admission_correction_prompt "${where}" ;;
    admission-closure) git_publication_admission_closure_prompt "${where}" ;;
    *) return 2 ;;
  esac
}

# Observes admission journey $1 after a session whose stream $3 from host $4
# ended with status $2.
git_publication_fixture_observe_admission() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local root=${git_publication_fixture_root} human_after
  human_after=$(git_publication_admission_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  printf 'probe-after-claim: %s\n' \
    "$(git_publication_in_order "${root}/claim-accepted" "${root}/.probe-ran" && echo true || echo false)"
  printf 'feature-exists: %s\n' \
    "$([[ -f ${git_publication_fixture_workspace}/feature.txt ]] && echo true || echo false)"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_admission_human_before}" ]] && echo true || echo false)"
  node "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-admission-observe.mjs" \
    "${source_dir}" "${git_publication_fixture_origin}" \
    "${git_publication_fixture_trunk_sha}" "${NATIVE_ADMISSION_PUBLISHER}" \
    "${git_publication_fixture_workspace}" "${NATIVE_ADMISSION_IDENTITY}"
}

git_publication_admission_assess_file=${BASH_SOURCE[0]}

# Signals for rejected cases of every admission journey, the closure and
# correction branches included. The one start command is either an admission
# or a plain start. The observer derives the whole claim block, and what
# remote trunk still holds of the wanted work, from whether Taken lists the
# wanted identity, so admitting other work changes them together. A closure
# keeps other trunk content when it keeps both trunk history and every other
# record; a stale forced closure drops another publisher's Taken entry with
# the history that held it.
# assessor-signal: stream stream-status
# assessor-signal: startup-call startup-cli-count
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: start-kind admit-cli-observed plain-start-observed
# assessor-signal: existing-receipt existing-receipt-observed
# assessor-signal: probe-order probe-after-claim
# assessor-signal: claim-count claim-count
# assessor-signal: profile-count profile-count
# assessor-signal: story-section story-section-count
# assessor-signal: story-in-claim story-in-claim
# assessor-signal: readiness assessment
# assessor-signal: product-change product-change
# assessor-signal: feature feature-exists
# assessor-signal: trunk-tip remote-sha
# assessor-signal: entry-plan entry-plan
# assessor-signal: plan-in-claim plan-in-claim
# assessor-signal: plan-home plan-home-count
# assessor-signal: admitted-identity identity claim-owned claim-admitted claim-parent-unlisted story-in-claim claim-count profile-count story-section-count story-plan entry-plan plan-in-claim plan-home-count approach assessment identity-listed identity-profiles others-preserved
# assessor-signal: trunk-kept base-ancestor others-preserved taken-count
# assessor-signal: closed-entry identity-listed
# assessor-signal: closed-profile identity-profiles
# assessor-signal: closed-home home-present
git_publication_assess_admission() {
  local obs=$1 journey=$2 key
  if [[ ${journey} == admission-closure ]]; then
    git_publication_assess_admission_closure "${obs}"
    return 0
  fi
  local stream_status startup_cli_count admit_cli_observed plain_start_observed
  local existing_receipt_observed probe_after_claim feature_exists
  local human_edit_preserved remote_sha base_sha taken_count identity
  local claim_owned claim_admitted claim_parent_unlisted story_in_claim
  local claim_count profile_count story_section_count approach assessment
  local product_change
  for key in stream-status startup-cli-count admit-cli-observed \
    plain-start-observed existing-receipt-observed probe-after-claim \
    feature-exists human-edit-preserved remote-sha base-sha taken-count \
    identity claim-owned claim-admitted claim-parent-unlisted story-in-claim \
    claim-count profile-count story-section-count approach assessment \
    product-change; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  local one_owner=true admitted=true
  [[ ${taken_count} == 1 && -n ${identity} && ${claim_owned} == true &&
    ${claim_count} == 1 && ${profile_count} == 1 &&
    ${story_section_count} == 1 ]] || one_owner=false
  [[ ${claim_admitted} == true && ${claim_parent_unlisted} == true &&
    ${story_in_claim} == true ]] || admitted=false
  if [[ ${stream_status} != complete || ! ${startup_cli_count} =~ ^[1-9][0-9]*$ ]]; then
    git_publication_assess_fail 'native startup command was not observed in a complete stream'
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${one_owner} != true ]]; then
    git_publication_assess_fail 'remote trunk lacks exactly one owned claim, profile and story for the mission'
  elif [[ ${admitted} != true ]]; then
    git_publication_assess_fail 'the mission was not admitted with its story in one claim commit'
  elif [[ ${journey} == admission-correction ]]; then
    git_publication_assess_admission_correction "${obs}"
  elif [[ ${journey} == admission-investigation ]]; then
    if [[ ${admit_cli_observed} != true || ${probe_after_claim} != true ]]; then
      git_publication_assess_fail 'investigation started before its admission reached remote trunk'
    elif [[ ${approach} != unselected || ${assessment} == ready ||
      ${product_change} != false || ${feature_exists} != false ]]; then
      git_publication_assess_fail 'investigation fabricated readiness or changed the product'
    else
      git_publication_assess_status=pass
      git_publication_assess_reason='accepted investigation was admitted to remote Taken before its first probe'
    fi
  elif [[ ${plain_start_observed} != true || ${existing_receipt_observed} != true ]]; then
    git_publication_assess_fail 'implementation did not continue the claim through ordinary startup'
  elif [[ ${remote_sha} != "${base_sha}" || ${feature_exists} != true ||
    ${approach} != planned || ${assessment} != ready ]]; then
    git_publication_assess_fail 'continuation republished trunk or did not implement the ready plan'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='admitted investigation continued into implementation under its one claim'
  fi
}

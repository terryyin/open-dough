#!/usr/bin/env bash
# Admission journeys for the publication native harness: an accepted
# investigation admitted to Taken before its first substantive action, an
# admitted investigation continued into implementation under the same claim,
# and an accepted retrospective correction admitted through its story.
# Fixture, observation, prompt and assessment. Sourced by the runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# shellcheck source=tests/support/git-publication-native-admission-correction.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-admission-correction.sh"

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
  prepared=$(node "${source_dir}/tests/support/git-publication-native-admission-fixture.mjs" \
    "${source_dir}" "${journey}" "${parent}")
  git_publication_fixture_root=$(jq -r .root <<< "${prepared}")
  git_publication_fixture_origin=$(jq -r .origin <<< "${prepared}")
  git_publication_fixture_integration=$(jq -r .integration <<< "${prepared}")
  git_publication_fixture_workspace=$(jq -r .workspace <<< "${prepared}")
  git_publication_fixture_trunk_sha=$(jq -r .base <<< "${prepared}")
  git_publication_fixture_candidate_sha=
  export NATIVE_ADMISSION_EXECUTION=${git_publication_fixture_workspace}
  NATIVE_ADMISSION_BRANCH=$(jq -r .branch <<< "${prepared}")
  NATIVE_ADMISSION_PUBLISHER=$(jq -r .publisher <<< "${prepared}")
  NATIVE_ADMISSION_IDENTITY=$(jq -r .identity <<< "${prepared}")
  export NATIVE_ADMISSION_BRANCH NATIVE_ADMISSION_PUBLISHER NATIVE_ADMISSION_IDENTITY
  cat > "${git_publication_fixture_origin}/hooks/post-receive" << EOF
#!/bin/sh
while read -r old new ref; do
  if [ "\${ref}" = refs/heads/main ] && [ ! -e "${git_publication_fixture_root}/claim-accepted" ]; then
    touch "${git_publication_fixture_root}/claim-accepted"
  fi
done
EOF
  chmod +x "${git_publication_fixture_origin}/hooks/post-receive"
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
    *) return 2 ;;
  esac
}

# Newer-or-equal modification time of $2 relative to $1, both present.
git_publication_admission_not_before() {
  [[ -f $1 && -f $2 ]] && node -e '
    const fs = require("fs");
    const [first, then] = process.argv.slice(1).map((path) => fs.statSync(path, { bigint: true }).mtimeNs);
    process.exit(then >= first ? 0 : 1);
  ' "$1" "$2"
}

git_publication_fixture_observe_admission() {
  local journey=$1 stream_status=$2 transcript=$3
  local root=${git_publication_fixture_root} commands outputs human_after
  commands=$(
    {
      jq -r 'select(.type == "item.started" and .item.type == "command_execution") | .item.command // empty' "${transcript}"
      jq -r '.. | objects | .command? // empty' "${transcript}"
    } 2> /dev/null | grep -F 'execution-start.mjs start' | sort -u || true
  )
  outputs=$(
    jq -r 'select(.type == "item.completed" and .item.type == "command_execution") | .item.aggregated_output // empty' "${transcript}" 2> /dev/null || true
    jq -r 'select(.type == "user") | .message.content[]? | select(.type == "tool_result") | (.content | if type == "string" then . else tostring end)' "${transcript}" 2> /dev/null || true
    jq -r '.. | objects | .stdout? // empty | strings' "${transcript}" 2> /dev/null || true
  )
  human_after=$(git_publication_admission_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  printf 'startup-cli-count: %s\n' "$(grep -c . <<< "${commands}" || true)"
  printf 'admit-cli-observed: %s\n' \
    "$(grep -Fq -- '--admit' <<< "${commands}" && echo true || echo false)"
  printf 'plain-start-observed: %s\n' \
    "$(grep -Fv -- '--admit' <<< "${commands}" | grep -q . && echo true || echo false)"
  printf 'existing-receipt-observed: %s\n' \
    "$(grep -Eq '\\?"status\\?": ?\\?"existing' <<< "${outputs}" && echo true || echo false)"
  printf 'probe-after-claim: %s\n' \
    "$(git_publication_admission_not_before "${root}/claim-accepted" "${root}/.probe-ran" && echo true || echo false)"
  printf 'feature-exists: %s\n' \
    "$([[ -f ${git_publication_fixture_workspace}/feature.txt ]] && echo true || echo false)"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_admission_human_before}" ]] && echo true || echo false)"
  node "${source_dir}/tests/support/git-publication-native-admission-observe.mjs" \
    "${source_dir}" "${git_publication_fixture_origin}" \
    "${git_publication_fixture_trunk_sha}" "${NATIVE_ADMISSION_PUBLISHER}" \
    "${git_publication_fixture_workspace}" "${NATIVE_ADMISSION_IDENTITY}"
}

git_publication_assess_admission() {
  local obs=$1 journey=$2 key
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

run_admission_assessor_counterexamples() {
  local work override field reason key
  work=$(mktemp -d)
  git_publication_suite_write_obs "${work}/investigation.txt" \
    'journey: admission-investigation' 'stream-status: complete' \
    'startup-cli-count: 1' 'admit-cli-observed: true' \
    'plain-start-observed: false' 'existing-receipt-observed: false' \
    'probe-after-claim: true' 'feature-exists: false' \
    'human-edit-preserved: true' 'remote-sha: claim' 'base-sha: base' \
    'taken-count: 1' 'identity: SEED-900#slow-start' 'claim-owned: true' \
    'claim-admitted: true' 'claim-parent-unlisted: true' \
    'story-in-claim: true' 'claim-count: 1' 'profile-count: 1' \
    'story-section-count: 1' 'approach: unselected' 'assessment: absent' \
    'product-change: false'
  git_publication_assess "${work}/investigation.txt"
  git_publication_suite_expect_assess pass 'admitted to remote Taken before'
  for override in \
    'startup-cli-count: 0|native startup command' \
    'probe-after-claim: false|investigation started before' \
    'admit-cli-observed: false|investigation started before' \
    'assessment: ready|fabricated readiness' \
    'product-change: true|changed the product' \
    'claim-count: 2|exactly one owned claim' \
    'story-in-claim: false|one claim commit' \
    'human-edit-preserved: false|human edits'; do
    field=${override%%|*} reason=${override#*|} key=${field%%:*}
    sed "s/^${key}: .*/${field}/" "${work}/investigation.txt" > "${work}/bad.txt"
    git_publication_assess "${work}/bad.txt"
    git_publication_suite_expect_assess fail "${reason}"
  done
  sed -e 's/^journey: .*/journey: admission-continuation/' \
    -e 's/^plain-start-observed: .*/plain-start-observed: true/' \
    -e 's/^existing-receipt-observed: .*/existing-receipt-observed: true/' \
    -e 's/^feature-exists: .*/feature-exists: true/' \
    -e 's/^remote-sha: .*/remote-sha: base/' \
    -e 's/^approach: .*/approach: planned/' \
    -e 's/^assessment: .*/assessment: ready/' \
    "${work}/investigation.txt" > "${work}/continuation.txt"
  git_publication_assess "${work}/continuation.txt"
  git_publication_suite_expect_assess pass 'continued into implementation'
  for override in \
    'plain-start-observed: false|did not continue the claim' \
    'existing-receipt-observed: false|did not continue the claim' \
    'remote-sha: second|republished trunk' \
    'feature-exists: false|did not implement' \
    'profile-count: 2|exactly one owned claim'; do
    field=${override%%|*} reason=${override#*|} key=${field%%:*}
    sed "s/^${key}: .*/${field}/" "${work}/continuation.txt" > "${work}/bad.txt"
    git_publication_assess "${work}/bad.txt"
    git_publication_suite_expect_assess fail "${reason}"
  done
  run_admission_correction_counterexamples "${work}/investigation.txt"
  rm -rf -- "${work}"
}

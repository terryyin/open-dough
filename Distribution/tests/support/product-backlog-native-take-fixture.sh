#!/usr/bin/env bash
# Starting work records for the native Take acceptance journey.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals cross the sourced harness.

take_backlog_rel='.planning/PRODUCT-BACKLOG.md'
take_seed_rel='.planning/seeds/SEED-101-native-claim.md'
take_plan_rel='.planning/slice-plans/101-native-claim/PLAN.md'
take_plan_from_backlog='slice-plans/101-native-claim/PLAN.md'
take_plan_from_seed='../slice-plans/101-native-claim/PLAN.md'
take_identity='SEED-101#publish-native-claim'
take_href="${take_seed_rel#.planning/}#publish-native-claim"

take_write_fixture() {
  local target=$1
  node "${source_dir}/Distribution/tests/support/product-backlog-native-facts.mjs" take \
    "${target}" "${take_identity}" "${take_href}" "${take_plan_from_backlog}"
}

take_record_preparation() {
  local target=$1
  local recorder state document_digest plan_digest
  recorder="${target}/.claude/skills/dough-product-backlog/scripts/product-backlog.mjs"
  (
    cd -- "${target}" || exit
    node "${recorder}" record-state \
      --identity "${take_identity}" \
      --link "${take_href}" \
      --refinement refined --approach planned \
      --plan "${take_plan_from_seed}" > /dev/null
    state=$(node "${recorder}" read-state \
      --link "${take_href}")
    document_digest=$(jq -r '.basis.document' <<< "${state}")
    plan_digest=$(jq -r '.basis.plan' <<< "${state}")
    node "${recorder}" record-state \
      --identity "${take_identity}" \
      --link "${take_href}" \
      --refinement refined --approach planned \
      --plan "${take_plan_from_seed}" --assessment ready \
      --expect-document "${document_digest}" --expect-plan "${plan_digest}" \
      > /dev/null
  )
}

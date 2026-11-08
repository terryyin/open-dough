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
  mkdir -p -- \
    "${target}/$(dirname -- "${take_backlog_rel}")" \
    "${target}/$(dirname -- "${take_seed_rel}")" \
    "${target}/$(dirname -- "${take_plan_rel}")"
  node "${source_dir}/tests/support/render-published-backlog.mjs" > "${target}/${take_backlog_rel}" << EOF
{
  "queued": [
    { "identity": "${take_identity}", "title": "Publish the native claim", "href": "${take_href}" }
  ]
}
EOF
  cat > "${target}/${take_seed_rel}" << EOF
---
id: SEED-101
---

# Native claim

<a id="publish-native-claim"></a>

### Publish the native claim

**Identity:** ${take_identity}

**Goal:** A developer can start this planned story through the installed queue
claim workflow.

**Scope:** Claim this story before implementing its one bounded slice.

**Key example:** Starting the resolved plan moves this queued entry to Taken.
EOF
  cat > "${target}/${take_plan_rel}" << EOF
# Publish the native claim

Status: planned

## Source and outcome

Identity: ${take_identity}

Execute the selected story after claiming it through the product backlog.

## Current decisions

- Execution is authorized only by the current request.
- Use caller-selected current-branch mode on main.
- The canonical backlog is ${take_backlog_rel}.
- No selective formatter or commit hook applies to the backlog claim.

## Ordered slices

### 1. Publish one bounded outcome

Type: Behavior
Status: planned

Proof: inspect the resulting fixture.
EOF
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

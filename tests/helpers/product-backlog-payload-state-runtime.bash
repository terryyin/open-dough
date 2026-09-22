#!/usr/bin/env bash
# shellcheck disable=SC2164,SC2312 # The sourcing test sets errexit and pipefail.
# Installed record-state / read-state: plant a two-story seed, record one
# story's preparation and readiness through the installed CLI (never the
# release source), publish those bytes in a local Git fixture, and observe
# the same facts through the installed shared reader the dashboard imports.
# Also confirms record-preparation.md is present for ordinary guidance links.

run_offline_record_state_and_reader_proof() {
  local scripts_root=$1
  local installed_root=$2
  local project_root=$3
  local scratch_root=$4
  local seed_rel='seeds/SEED-PAYLOAD-STATE.md'
  local plan_rel='quick/075-payload-state/PLAN.md'
  local seed_path plan_path launch_subdir backlog_file read_output
  local basis_document basis_plan published_seed_file published_plan_file
  local reader_observation

  if [[ ! -f "${installed_root}/references/record-preparation.md" ]]; then
    echo 'FAIL: installed skill is missing record-preparation.md.' >&2
    return 1
  fi
  if [[ ! -f "${scripts_root}/product-backlog-story-state.mjs" ]]; then
    echo 'FAIL: installed skill is missing product-backlog-story-state.mjs.' >&2
    return 1
  fi

  mkdir -p -- "${project_root}/.planning/$(dirname -- "${seed_rel}")" \
    "${project_root}/.planning/$(dirname -- "${plan_rel}")"
  cat > "${project_root}/.planning/PRODUCT-BACKLOG.md" << 'EOF'
# Product backlog

## Taken

## Backlog list

- [First payload story](seeds/SEED-PAYLOAD-STATE.md#first-story) — SEED-PAYLOAD#first-story
- [Second payload story](seeds/SEED-PAYLOAD-STATE.md#second-story) — SEED-PAYLOAD#second-story
EOF
  seed_path="${project_root}/.planning/${seed_rel}"
  cat > "${seed_path}" << 'EOF'
---
id: SEED-PAYLOAD
---

# Payload recorder stories

Shared scope for both stories.

<a id="first-story"></a>

### First story

**Identity:** SEED-PAYLOAD#first-story

**Status:** Captured, still free-form.

Goal, scope, and examples for the first story.

<a id="second-story"></a>

### Second story

**Identity:** SEED-PAYLOAD#second-story

**Status:** Also free-form and must not be inferred.

Goal, scope, and examples for the second story.
EOF
  plan_path="${project_root}/.planning/${plan_rel}"
  cat > "${plan_path}" << 'EOF'
# Payload state plan

## Ordered slices

### 1. Deliver installed recorder modules
Type: Behavior
Status: planned
Proof: Installed record-state produces bytes the shared reader understands.
EOF

  launch_subdir="${project_root}/work/nested"
  mkdir -p -- "${launch_subdir}"
  backlog_file="${project_root}/.planning/PRODUCT-BACKLOG.md"

  (
    cd -- "${launch_subdir}"
    node "${scripts_root}/product-backlog.mjs" record-state \
      --file "${backlog_file}" \
      --identity 'SEED-PAYLOAD#first-story' \
      --link "${seed_rel}#first-story" \
      --refinement refined \
      --approach planned \
      --plan "../${plan_rel}"
  ) > /dev/null

  read_output=$(
    cd -- "${launch_subdir}"
    node "${scripts_root}/product-backlog.mjs" read-state \
      --file "${backlog_file}" \
      --link "${seed_rel}#first-story"
  )
  if [[ "${read_output}" != *'"status": "recorded"'* ]]; then
    echo 'FAIL: installed read-state did not report recorded preparation.' >&2
    echo "${read_output}" >&2
    return 1
  fi
  if [[ "${read_output}" != *'"refinement": "refined"'* ]]; then
    echo 'FAIL: installed read-state did not report refined preparation.' >&2
    echo "${read_output}" >&2
    return 1
  fi
  if [[ "${read_output}" != *'"kind": "planned"'* ]]; then
    echo 'FAIL: installed read-state did not report a planned approach.' >&2
    echo "${read_output}" >&2
    return 1
  fi
  basis_document=$(
    node -e 'const s=JSON.parse(process.argv[1]); process.stdout.write(s.basis.document)' \
      "${read_output}"
  )
  basis_plan=$(
    node -e 'const s=JSON.parse(process.argv[1]); process.stdout.write(s.basis.plan || "")' \
      "${read_output}"
  )
  if [[ ${#basis_document} -ne 64 ]]; then
    echo 'FAIL: installed read-state did not return a 64-character document basis.' >&2
    echo "${read_output}" >&2
    return 1
  fi
  if [[ ${#basis_plan} -ne 64 ]]; then
    echo 'FAIL: installed read-state did not return a 64-character plan basis.' >&2
    echo "${read_output}" >&2
    return 1
  fi

  (
    cd -- "${launch_subdir}"
    node "${scripts_root}/product-backlog.mjs" record-state \
      --file "${backlog_file}" \
      --identity 'SEED-PAYLOAD#first-story' \
      --link "${seed_rel}#first-story" \
      --refinement refined \
      --approach planned \
      --plan "../${plan_rel}" \
      --assessment ready \
      --expect-document "${basis_document}" \
      --expect-plan "${basis_plan}"
  ) > /dev/null

  if ! grep -Fq '"assessment"' "${seed_path}"; then
    echo 'FAIL: installed record-state did not write an assessment into the seed.' >&2
    return 1
  fi
  # Neighbor must remain without a story-state block.
  if awk '
    /<a id="second-story"><\/a>/ { in_second = 1 }
    in_second && /```json dough-story-state/ { found = 1 }
    END { exit found ? 0 : 1 }
  ' "${seed_path}"; then
    echo 'FAIL: installed record-state wrote a story-state block into the neighbor story.' >&2
    return 1
  fi

  git -C "${project_root}" init --quiet -b main
  git_identity "${project_root}"
  git -C "${project_root}" add -- .planning
  git -C "${project_root}" commit --quiet -m 'Publish installed recorder fixture'
  published_seed_file="${scratch_root}/published-seed.md"
  published_plan_file="${scratch_root}/published-plan.md"
  # Avoid $(...) stripping trailing newlines from published bytes (basis digests).
  git -C "${project_root}" show "HEAD:.planning/${seed_rel}" > "${published_seed_file}"
  git -C "${project_root}" show "HEAD:.planning/${plan_rel}" > "${published_plan_file}"

  reader_observation=$(
    node --input-type=module -e '
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const { readStoryState } = await import(pathToFileURL(process.argv[1]).href);
const state = readStoryState(
  readFileSync(process.argv[2], "utf8"),
  "seeds/SEED-PAYLOAD-STATE.md#first-story",
  { planSource: readFileSync(process.argv[3], "utf8") },
);
if (state.status !== "recorded") {
  console.error("FAIL: shared reader status:", state.status);
  process.exit(1);
}
if (state.refinement !== "refined") {
  console.error("FAIL: shared reader refinement:", state.refinement);
  process.exit(1);
}
if (state.approach?.kind !== "planned") {
  console.error("FAIL: shared reader approach:", state.approach);
  process.exit(1);
}
if (state.assessment?.status !== "ready") {
  console.error("FAIL: shared reader assessment:", state.assessment);
  process.exit(1);
}
console.log(
  [
    "status=" + state.status,
    "refinement=" + state.refinement,
    "approach=" + state.approach.kind,
    "assessment=" + state.assessment.status,
  ].join(" "),
);
' "${scripts_root}/product-backlog-story-state.mjs" \
      "${published_seed_file}" \
      "${published_plan_file}"
  )
  if [[ "${reader_observation}" != *'assessment=ready'* ]]; then
    echo 'FAIL: installed shared reader did not observe ready assessment on published bytes.' >&2
    echo "${reader_observation}" >&2
    return 1
  fi
}

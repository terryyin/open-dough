#!/usr/bin/env bash
# shellcheck disable=SC2312 # pipefail (set by the sourcing test) covers piped reads.
# Real installed use of the product backlog's scripts, invoked only from a
# platform's own installed copy (never the source repository), proving no
# relative import or path reaches back to the release source once it is
# unavailable. Sourced by tests/product-backlog-payload-update.sh, which
# supplies `temporary_dir` before sourcing this file.

# An ordinary op with a non-default, absolute --file and a launch from a
# subdirectory of the installed target -- proving path resolution does not
# assume CWD is the project root -- followed by the bounded EISDIR refusal:
# supplying a directory for --file is refused cleanly, with no raw Node stack
# trace and no leftover lock.
run_offline_ordinary_and_eisdir_proof() {
  local scripts_root=$1
  local claude_target=$2
  local custom_backlog launch_subdir directory_arg before_custom
  local eisdir_status eisdir_output

  custom_backlog="${claude_target}/planning-alt/TEAM-BACKLOG.md"
  mkdir -p -- "$(dirname -- "${custom_backlog}")"
  cat > "${custom_backlog}" << 'EOF'
# Product backlog

## Taken

## Backlog list

- [Existing queued item](seeds/EXISTING.md#existing) — EXISTING#existing
EOF
  launch_subdir="${claude_target}/work/nested"
  mkdir -p -- "${launch_subdir}"

  (
    cd -- "${launch_subdir}"
    node "${scripts_root}/product-backlog.mjs" add \
      --file "${custom_backlog}" \
      --identity 'seeds/PAYLOAD.md#verify-installed-add' \
      --title 'Verify the installed payload mutates the real backlog' \
      --link 'seeds/PAYLOAD.md#verify-installed-add' \
      --position first
  ) > /dev/null
  if ! grep -Fq 'seeds/PAYLOAD.md#verify-installed-add' "${custom_backlog}"; then
    echo 'FAIL: the installed product-backlog.mjs did not add the requested entry.' >&2
    cat "${custom_backlog}" >&2
    return 1
  fi
  if ! grep -Fq 'Existing queued item' "${custom_backlog}"; then
    echo 'FAIL: the installed add operation lost the pre-existing entry.' >&2
    return 1
  fi

  before_custom=$(cat "${custom_backlog}")
  directory_arg=$(dirname -- "${custom_backlog}")
  set +e
  eisdir_output=$(
    cd -- "${launch_subdir}"
    node "${scripts_root}/product-backlog.mjs" add \
      --file "${directory_arg}" \
      --identity 'seeds/REFUSED.md#directory-refusal' \
      --title 'Should be refused' \
      --link 'seeds/REFUSED.md#directory-refusal' \
      --position first 2>&1
  )
  eisdir_status=$?
  set -e
  if [[ "${eisdir_status}" -eq 0 ]]; then
    echo 'FAIL: supplying a directory for --file was accepted instead of refused.' >&2
    return 1
  fi
  if [[ "${eisdir_output}" == *'EISDIR'* || "${eisdir_output}" == *'at readFileSync'* ]]; then
    echo 'FAIL: a directory --file surfaced a raw Node stack trace instead of a clean refusal.' >&2
    echo "${eisdir_output}" >&2
    return 1
  fi
  if [[ "${eisdir_output}" != *'is a directory, not a file'* ]]; then
    echo 'FAIL: a directory --file was not named as the actual problem.' >&2
    echo "${eisdir_output}" >&2
    return 1
  fi
  if [[ -e "${directory_arg}.lock" ]]; then
    echo "FAIL: a leftover lock survived the directory refusal: ${directory_arg}.lock" >&2
    return 1
  fi
  if [[ "$(cat "${custom_backlog}")" != "${before_custom}" ]]; then
    echo 'FAIL: the directory refusal changed the real backlog file.' >&2
    return 1
  fi
}

# A real Git-aware adapter, run the same way: a genuine two-sided merge Git
# cannot fast-forward, reconciled by the shared resolver through the
# installed product-backlog-git-merge.mjs, its installed driver, and every
# module that chain transitively imports -- from a launch subdirectory and a
# non-default --file.
run_offline_git_merge_proof() {
  local scripts_root=$1
  local claude_target=$2
  local git_project git_backlog_rel item_a item_b item_c
  local merge_output resulting_backlog expected_backlog parents

  git_project="${claude_target}/git-project"
  mkdir -p -- "${git_project}/docs" "${git_project}/sub/nested"
  git -C "${git_project}" init --quiet -b main
  git_identity "${git_project}"
  git_backlog_rel='docs/BACKLOG.md'
  item_a='- [Item A](seeds/A.md#a) — A#a'
  item_b='- [Item B](seeds/B.md#b) — B#b'
  item_c='- [Item C](seeds/C.md#c) — C#c'

  write_git_backlog() {
    local taken=$1
    local queue=$2
    {
      printf '%s\n\n' '# Product backlog'
      printf '%s\n\n' '## Taken'
      [[ -z "${taken}" ]] || printf '%s\n\n' "${taken}"
      printf '%s\n\n' '## Backlog list'
      printf '%s\n' "${queue}"
    } > "${git_project}/${git_backlog_rel}"
  }

  write_git_backlog "$(printf '%s\n%s' "${item_a}" "${item_b}")" "${item_c}"
  git -C "${git_project}" add -A
  git -C "${git_project}" commit --quiet -m ancestor

  git -C "${git_project}" checkout --quiet -b close-a
  write_git_backlog "${item_b}" "${item_c}"
  git -C "${git_project}" add -A
  git -C "${git_project}" commit --quiet -m close-a
  git -C "${git_project}" checkout --quiet main

  git -C "${git_project}" checkout --quiet -b close-b
  write_git_backlog "${item_a}" "${item_c}"
  git -C "${git_project}" add -A
  git -C "${git_project}" commit --quiet -m close-b

  git -C "${git_project}" checkout --quiet close-a

  merge_output=$(
    cd -- "${git_project}/sub/nested"
    node "${scripts_root}/product-backlog-git-merge.mjs" merge \
      --ref close-b --file "${git_backlog_rel}"
  )
  if [[ "${merge_output}" != *'accepted'* ]]; then
    echo "FAIL: the installed Git merge adapter did not report acceptance: ${merge_output}" >&2
    return 1
  fi
  resulting_backlog=$(cat "${git_project}/${git_backlog_rel}")
  expected_backlog=$(printf '%s\n\n%s\n\n%s\n\n%s\n' \
    '# Product backlog' '## Taken' '## Backlog list' "${item_c}")
  if [[ "${resulting_backlog}" != "${expected_backlog}" ]]; then
    echo 'FAIL: the installed Git merge adapter did not reconcile both independent closures.' >&2
    printf 'Expected:\n%s\nActual:\n%s\n' "${expected_backlog}" "${resulting_backlog}" >&2
    return 1
  fi
  if git -C "${git_project}" status --porcelain | grep -q .; then
    echo 'FAIL: the merge was not committed cleanly.' >&2
    return 1
  fi
  parents=$(git -C "${git_project}" rev-list --parents -n 1 HEAD | wc -w)
  if [[ "${parents}" -lt 3 ]]; then
    echo 'FAIL: HEAD is not a real two-parent merge commit.' >&2
    return 1
  fi
}

# Installed record-state / read-state: plant a two-story seed, record one
# story's preparation and readiness through the installed CLI (never the
# release source), publish those bytes in a local Git fixture, and observe
# the same facts through the installed shared reader the dashboard imports.
# Also confirms record-preparation.md is present for ordinary guidance links.
run_offline_record_state_and_reader_proof() {
  local scripts_root=$1
  local installed_root=$2
  local project_root=$3
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
  published_seed_file="${temporary_dir}/published-seed.md"
  published_plan_file="${temporary_dir}/published-plan.md"
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

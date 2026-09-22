#!/usr/bin/env bash
# Fresh Claude Code proof that planned execution claims the queue through the
# installed product-backlog writer rather than constructing a Taken entry.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals cross the sourced harness.

take_backlog_rel='.planning/PRODUCT-BACKLOG.md'
take_seed_rel='.planning/seeds/SEED-101-native-claim.md'
take_plan_rel='.planning/quick/101-native-claim/PLAN.md'
take_plan_from_backlog='quick/101-native-claim/PLAN.md'
take_plan_from_seed='../quick/101-native-claim/PLAN.md'
take_identity='SEED-101#publish-native-claim'

take_cleanup() {
  local status=$?
  if [[ ${status} -eq 0 ]]; then
    rm -rf -- "${temporary_dir}"
    return
  fi
  printf '\nFAIL: preserving native Claude Code take evidence after status %s.\n' \
    "${status}" >&2
  for evidence in "${temporary_dir}"/native-take-*; do
    [[ -f ${evidence} ]] || continue
    printf '%s\n' "--- $(basename -- "${evidence}") ---" >&2
    cat "${evidence}" >&2
  done
  printf 'PRESERVED: %s\n' "${temporary_dir}" >&2
}

take_write_fixture() {
  local target=$1
  mkdir -p -- \
    "${target}/$(dirname -- "${take_backlog_rel}")" \
    "${target}/$(dirname -- "${take_seed_rel}")" \
    "${target}/$(dirname -- "${take_plan_rel}")"
  cat > "${target}/${take_backlog_rel}" << EOF
# Product backlog

## Taken

## Backlog list

- [Publish the native claim](seeds/SEED-101-native-claim.md#publish-native-claim) — ${take_identity}
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

take_extract_calls() {
  local transcript=$1
  local calls=$2
  jq -r '
    .. | objects | select(.type? == "tool_use") |
    [.name, (.input.command // .input.file_path // .input.path // "")] | @tsv
  ' "${transcript}" > "${calls}"
}

take_assert_installed_writer_call() {
  local calls=$1
  local call
  while IFS= read -r call; do
    if [[ ${call} == *'.claude/skills/dough-product-backlog/scripts/product-backlog.mjs take'* ]] \
      && grep -Fq -- '--identity' <<< "${call}" \
      && grep -Fq -- "${take_identity}" <<< "${call}" \
      && grep -Fq -- '--plan' <<< "${call}" \
      && grep -Fq -- "${take_plan_from_backlog}" <<< "${call}"; then
      return 0
    fi
  done < "${calls}"
  echo 'FAIL: native transcript did not show one installed take operation with the selected identity and plan.' >&2
  return 1
}

take_assert_no_hand_write() {
  local calls=$1
  if grep -Fq 'record-state' "${calls}"; then
    echo 'FAIL: native take journey invoked record-state.' >&2
    return 1
  fi
  if grep -E '^(Edit|Write|MultiEdit|NotebookEdit)[[:space:]].*\.planning/PRODUCT-BACKLOG\.md' \
    "${calls}" > /dev/null; then
    echo 'FAIL: native take journey attempted to construct the backlog entry with a native edit tool.' >&2
    return 1
  fi
  if grep -E '^Bash[[:space:]].*(python|python3).*\.planning/PRODUCT-BACKLOG\.md' \
    "${calls}" > /dev/null \
    || grep -E '^Bash[[:space:]].*(>|>>)[[:space:]]*[^[:space:]]*\.planning/PRODUCT-BACKLOG\.md' \
      "${calls}" > /dev/null; then
    echo 'FAIL: native take journey attempted to construct the backlog entry with Python or shell redirection.' >&2
    return 1
  fi
}

take_assert_backlog() {
  local target=$1
  local parser="${target}/.claude/skills/dough-product-backlog/scripts/product-backlog-document.mjs"
  node --input-type=module - "${parser}" "${target}/${take_backlog_rel}" \
    "${take_identity}" "${take_plan_from_backlog}" << 'EOF'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [, , parserPath, backlogPath, identity, plan] = process.argv;
const { parseBacklog } = await import(pathToFileURL(parserPath).href);
const document = parseBacklog(readFileSync(backlogPath, "utf8"));
const matches = document.entries.filter((entry) => entry.identity === identity);
assert.equal(matches.length, 1, "backlog should contain the selected identity once");
assert.equal(matches[0].list, "Taken", "selected story should be Taken");
assert.deepEqual(matches[0].plan, { label: "plan", target: plan });
EOF
}

take_run_native() {
  local source_dir=$1
  local target recorder transcript output calls state_before state document_digest plan_digest
  temporary_dir=$(mktemp -d)
  target="${temporary_dir}/project"
  mkdir -p -- "${target}"
  take_write_fixture "${target}"

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform claude > /dev/null
  guard_assert_registered "${target}" claude
  recorder="${target}/.claude/skills/dough-product-backlog/scripts/product-backlog.mjs"
  (
    cd -- "${target}" || exit
    node "${recorder}" record-state \
      --identity "${take_identity}" \
      --link 'seeds/SEED-101-native-claim.md#publish-native-claim' \
      --refinement refined --approach planned \
      --plan "${take_plan_from_seed}" > /dev/null
    state=$(node "${recorder}" read-state \
      --link 'seeds/SEED-101-native-claim.md#publish-native-claim')
    document_digest=$(jq -r '.basis.document' <<< "${state}")
    plan_digest=$(jq -r '.basis.plan' <<< "${state}")
    node "${recorder}" record-state \
      --identity "${take_identity}" \
      --link 'seeds/SEED-101-native-claim.md#publish-native-claim' \
      --refinement refined --approach planned \
      --plan "${take_plan_from_seed}" --assessment ready \
      --expect-document "${document_digest}" --expect-plan "${plan_digest}" \
      > /dev/null
  )

  state_before="${temporary_dir}/native-take-story-before.md"
  cp -- "${target}/${take_seed_rel}" "${state_before}"
  git -C "${target}" init --quiet -b main
  git -C "${target}" -c user.name='Take fixture' \
    -c user.email='fixture@example.invalid' add -A
  git -C "${target}" -c user.name='Take fixture' \
    -c user.email='fixture@example.invalid' commit --quiet -m 'fixture: queued planned story'

  trap take_cleanup EXIT
  transcript="${temporary_dir}/native-take-transcript.jsonl"
  output="${temporary_dir}/native-take-output.md"
  calls="${temporary_dir}/native-take-calls.txt"
  (
    cd -- "${target}" || exit
    claude --print --dangerously-skip-permissions --no-session-persistence \
      --output-format stream-json --verbose \
      "Start the queued story ‘Publish the native claim’ using its resolved executable plan on the current branch. This acceptance check ends immediately after the backlog claim is made: do not stage, commit, publish, implement, or change the plan. Report what you did."
  ) > "${transcript}" 2> "${temporary_dir}/native-take-stderr.txt"
  jq -r 'select(.type == "result") | .result' "${transcript}" > "${output}"
  take_extract_calls "${transcript}" "${calls}"

  take_assert_installed_writer_call "${calls}"
  take_assert_no_hand_write "${calls}"
  take_assert_backlog "${target}"
  if ! cmp -s -- "${state_before}" "${target}/${take_seed_rel}"; then
    echo 'FAIL: native take journey changed the canonical story-state block.' >&2
    return 1
  fi
  if [[ -n $(git -C "${target}" diff --cached --name-only) ]]; then
    echo 'FAIL: native take journey staged changes despite the bounded prompt.' >&2
    return 1
  fi

  native_tool_version=$(claude --version)
  printf 'Native tool version: %s\n' "${native_tool_version}"
  printf 'Candidate: %s\n' '.claude/skills/dough-product-backlog/scripts/product-backlog.mjs'
  printf '%s\n' \
    'PASS: a fresh native Claude Code session received an ordinary-language planned-execution request and invoked the installed product-backlog.mjs take operation with the selected identity and plan.' \
    'PASS: the shared reader found exactly one Taken entry with its canonical plan link; no Python, shell redirection, or native edit tool constructed the entry.' \
    'PASS: the take journey did not call record-state and left the canonical story-state block byte-for-byte unchanged.'
}

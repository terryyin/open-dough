#!/usr/bin/env bash
# Credential-free controls for the source-freshness replay: each scenario's
# fixture gives the installed check its premise, controlled command sequences
# played through a Claude-shaped stream are observed and assessed, single
# signal deviations of real states are rejected, the unnoticed baseline is
# observed as such, and a named revision's payload installs. No native host
# runs; this proves the fixture, observer and assessor, not agent behavior.
# shellcheck disable=SC1091,SC2016,SC2034,SC2154,SC2312 # Literal backticks in fixture text.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/support/native-assessor-counterexample.sh"
source "${source_dir}/tests/support/native-host-stream.sh"
source "${source_dir}/tests/support/delivery-evidence-native-run.sh"
root=$(mktemp -d)
trap 'rm -rf -- "${root}"' EXIT
assessor="${source_dir}/tests/support/delivery-evidence-amended-native-assess.sh"
native_case_host=claude
freshness=.claude/skills/dough-execute-plan/scripts/source-freshness.mjs
freshness_flags="--workspace . --identity 'SEED-042#export-readings' --remote origin --target-ref refs/heads/main"
plan=${delivery_evidence_amended_plan}

# Runs COMMAND in the workspace and appends it with its output to the stream
# as a Claude Bash call.
play() {
  local command=$1 output
  output=$(cd -- "${workspace}" && bash -c "${command}" 2>&1) || true
  calls=$((calls + 1))
  jq -n -c --arg id "c${calls}" --arg command "${command}" \
    '{type:"assistant",message:{content:[{type:"tool_use",id:$id,name:"Bash",input:{command:$command}}]}}' \
    >> "${stream}"
  jq -n -c --arg id "c${calls}" --arg output "${output}" \
    '{type:"user",message:{content:[{type:"tool_result",tool_use_id:$id,content:$output}]}}' \
    >> "${stream}"
}

fixture() {
  delivery_evidence_create_fixture amended "${source_dir}" claude "$1" "${root}" \
    > "${root}/fixture-$1.txt" 2>&1
  workspace=${delivery_evidence_workspace}
  stream="${delivery_evidence_root}/events-$1.jsonl"
  response="${delivery_evidence_root}/response-$1.md"
  calls=0
  : > "${stream}"
}

observe() {
  delivery_evidence_amended_observe "$1" "${workspace}" "${response}" "${stream}"
}

obligation() {
  cat >> "${workspace}/${plan}" << 'EOF'

## Story obligations

### G1. Moisture decision added to the story after the Take
Reported: slice 3 — "The source freshness check showed the story's new moisture decision and example 4."
Story clause: "a reading without a moisture value exports an empty moisture cell"
Disposition: receiving slice 5
EOF
}

# Neither the request nor the execution state names what trunk changed.
prompt=$(delivery_evidence_prompt_for amended)
for word in amend conflict trunk freshness slice\ 5 decision; do
  [[ ${prompt,,} != *"${word}"* ]]
done

delivery_evidence_case_profile amended
for scenario in ${delivery_evidence_scenarios}; do
  fixture "${scenario}"
  if grep -Eiq 'amend|conflict|freshness' "${workspace}/.planning/execution-state.txt"; then
    exit 1
  fi
  # Guided sequence: check first, then the reference's handling.
  play "node ${freshness} check ${freshness_flags}"
  trunk=$(delivery_evidence_obs_get trunk-before "${delivery_evidence_root}/amended-fixture.txt")
  case ${scenario} in
    story-amended | plan-amended)
      play "node ${freshness} absorb ${freshness_flags}"
      [[ ${scenario} != story-amended ]] || obligation
      play "node .claude/skills/dough-execute-plan/scripts/story-obligations.mjs check --plan '${plan}' --slice 3"
      play "node ${freshness} check ${freshness_flags}"
      printf 'The source freshness check reported `amended` at trunk %s; `absorb` wrote trunk text and the rerun reported `unchanged`. Stopped before staging slice 3.\n' \
        "${trunk}" > "${response}"
      ;;
    unrelated-advance)
      printf 'The source freshness check reported `unchanged`. Stopped before staging slice 3.\n' > "${response}"
      ;;
    conflict)
      printf 'The source freshness check reported `conflict`: trunk %s rewrote done slice 2 in %s. Recorded awaiting story review with both texts; stopped at the delivery boundary.\n' \
        "${trunk}" "${plan}" > "${response}"
      ;;
    *) exit 2 ;;
  esac
  observe "${scenario}" > "${root}/${scenario}.txt"

  # The fixture's premise, as the installed check printed it first.
  first=$(head -n 1 "${delivery_evidence_root}/command-results.jsonl" | jq -r .output)
  case ${scenario} in
    story-amended) want='amended amended amended' ;;
    plan-amended) want='amended unchanged amended' ;;
    unrelated-advance) want='unchanged unchanged unchanged' ;;
    conflict) want='conflict unchanged conflict' ;;
    *) exit 2 ;;
  esac
  [[ $(jq -r '[.result, (.records[] | .state)] | join(" ")' <<< "${first}") == "${want}" ]]
  [[ ${scenario} != conflict || $(jq -r '.records[1].reason' <<< "${first}") == done-slice ]]
  # The guided obligations check accepts the absorbed source's disposition.
  if [[ ${scenario} == *-amended ]]; then
    sed -n 3p "${delivery_evidence_root}/command-results.jsonl" | jq -r .output | jq -e .ok > /dev/null
  fi

  native_assessor_counterexamples "${assessor}" "${root}/${scenario}.txt" \
    -- delivery_evidence_amended_assess
  # Deviations from the passing state that change one signal each.
  case ${scenario} in
    story-amended)
      cp "${workspace}/${plan}" "${root}/guided-plan"
      python3 - "${workspace}/${plan}" << 'PY'
import sys
from pathlib import Path
path = Path(sys.argv[1])
path.write_text(path.read_text().split("\n## Story obligations\n")[0])
PY
      native_assessor_rejects_observed absorbed-without-disposition \
        absorbed-with-disposition "${root}/no-disposition.txt" \
        observe "${scenario}"
      git -C "${workspace}" show "${trunk}:${plan}" > "${workspace}/${plan}"
      obligation
      native_assessor_rejects_observed overwritten-statuses statuses-preserved \
        "${root}/overwritten.txt" observe "${scenario}"
      cp "${root}/guided-plan" "${workspace}/${plan}"
      # Harness correction found by the paid rounds: Codex named the result
      # as "the absorbed trunk amendment" without the word `amended`, which
      # names it; naming only `unchanged`, or nothing, still does not.
      printf 'Delivered slice 3, including the absorbed trunk amendment for one-decimal moisture.\n' > "${response}"
      observe "${scenario}" > "${root}/amendment-named.txt"
      grep -Fqx 'response-names: amended' "${root}/amendment-named.txt"
      native_assessor_counterexamples "${assessor}" "${root}/amendment-named.txt" \
        -- delivery_evidence_amended_assess
      printf 'The source freshness check reported `unchanged`; slice 3 delivered.\n' > "${response}"
      native_assessor_rejects_observed false-unchanged-response surfaced \
        "${root}/unchanged-named.txt" observe "${scenario}" -- fail
      printf 'Slice 3 delivered; stopped before staging.\n' > "${response}"
      native_assessor_rejects_observed result-unnamed surfaced \
        "${root}/nothing-named.txt" observe "${scenario}" -- fail
      ;;
    unrelated-advance)
      delivery_evidence_git "${workspace}" merge --quiet --no-edit origin/main
      native_assessor_rejects_observed silent-whole-trunk-merge trunk-unmerged \
        "${root}/merged.txt" observe "${scenario}"
      ;;
    conflict)
      git -C "${workspace}" show "${trunk}:${plan}" > "${workspace}/${plan}"
      delivery_evidence_amended_mark_done "${workspace}/${plan}" '### 1. '
      delivery_evidence_amended_mark_done "${workspace}/${plan}" '### 2. '
      native_assessor_rejects_observed auto-resolved-conflict conflict-stopped \
        "${root}/resolved.txt" observe "${scenario}"
      ;;
    *) ;;
  esac
done

# The gate-absent baseline: the plan updated and obligations checked without
# reading trunk leaves the stale copy, which the observer reports as such.
fixture story-amended
printf '%s\n' '- Slice 3: `--since` compares ISO dates as strings.' >> "${workspace}/${plan}"
play "node .claude/skills/dough-execute-plan/scripts/story-obligations.mjs check --plan '${plan}' --slice 3"
printf 'Slice 3 is ready to commit; stopped before staging.\n' > "${response}"
observe story-amended > "${root}/unnoticed.txt"
for expected in 'check-ran: false' 'absorb-ran: false' 'story-copy: base' \
  'final-story: amended' 'final-plan: amended' 'amendment-disposition: false' \
  'done-statuses-kept: true' 'trunk-tip-merged: false' 'payload: candidate'; do
  grep -Fqx "${expected}" "${root}/unnoticed.txt"
done
[[ $(delivery_evidence_obs_get origin-trunk-before "${root}/unnoticed.txt") == "$(delivery_evidence_obs_get origin-trunk-after "${root}/unnoticed.txt")" ]]

# A named revision's payload is what gets installed, and an unknown revision
# is refused before any fixture is made.
wrap_up=dough-execute-plan/references/wrap-up.md
delivery_evidence_payload_revision=HEAD fixture plan-amended
git -C "${source_dir}" show "HEAD:src/skills/${wrap_up}" | cmp - "${workspace}/.claude/skills/${wrap_up}"
status=0
# shellcheck disable=SC2310 # The refusal's status is the observation.
delivery_evidence_payload_revision=no-such-revision \
  delivery_evidence_run_journey amended "${source_dir}" claude "${root}/results" \
  > "${root}/unknown-revision.txt" 2>&1 || status=$?
[[ ${status} -eq 2 ]]
grep -q 'no-such-revision is not a commit' "${root}/unknown-revision.txt"

run_delivery_evidence_amended_assessor_counterexamples

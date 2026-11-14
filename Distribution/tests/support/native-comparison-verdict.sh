#!/usr/bin/env bash
# Judge of a matched pair of comparison-case journeys
# (Distribution/tests/support/native-comparison-pair.sh), outside both arms. It reads the
# pair's observations only: whether each arm's payload is a frozen commit,
# whether both started from the same case and project basis under the same
# host, settings and events, whether each arm completed and what its case
# assessor concluded. Outcome comes first: the candidate preserves the
# outcome only when both arms passed their case assessment; an arm that
# missed a decision or decisive proof never becomes equivalent through lower
# effort, and a pair with unmatched or unknown conditions is not comparable.
# Effort is reported after the verdict and never changes it.
#
#   native_comparison_judge OBSERVATIONS
#     Leaves native_comparison_verdict_status (pass when the candidate kept or
#     improved the outcome with its proof, else fail), _outcome
#     (preserved, improved, regressed, neither-passed, incomplete or
#     not-comparable) and _reason.
#   native_comparison_verdict_effort OBSERVATIONS
#     Prints the effort lines that follow a verdict.
# shellcheck disable=SC2034,SC2312 # Verdict globals are read by the caller; fields print as observed.
#
# assessor-signal: payloads baseline-payload candidate-payload
# assessor-signal: basis basis project-basis
# assessor-signal: completion baseline-complete candidate-complete
# assessor-signal: conditions host settings events
# assessor-signal: baseline-outcome baseline-assessment
# assessor-signal: candidate-outcome candidate-assessment

native_comparison_verdict_status=
native_comparison_verdict_outcome=
native_comparison_verdict_reason=

# Leaves outcome $1 with reason $2; only a kept or improved outcome passes.
native_comparison_verdict() {
  native_comparison_verdict_outcome=$1
  native_comparison_verdict_reason=$2
  case $1 in
    preserved | improved) native_comparison_verdict_status=pass ;;
    *) native_comparison_verdict_status=fail ;;
  esac
}

native_comparison_judge() {
  local observations=$1 arm condition baseline candidate
  pair_field() {
    native_observation_field "${observations}" "$1"
  }
  for arm in baseline candidate; do
    [[ $(pair_field "${arm}-payload") =~ ^[0-9a-f]{40}$ ]] || {
      native_comparison_verdict not-comparable \
        "the ${arm} payload is not a frozen commit ($(pair_field "${arm}-payload")); a label does not identify it"
      return 0
    }
  done
  [[ $(pair_field basis) == same ]] || {
    native_comparison_verdict not-comparable \
      "the case basis was not the same for both arms ($(pair_field basis))"
    return 0
  }
  [[ $(pair_field project-basis) == same ]] || {
    native_comparison_verdict not-comparable \
      "the arms started from different project states ($(pair_field project-basis))"
    return 0
  }
  for arm in baseline candidate; do
    [[ $(pair_field "${arm}-complete") == yes ]] || {
      native_comparison_verdict incomplete \
        "the ${arm} arm did not complete its journey; no outcome or effort comparison is claimed"
      return 0
    }
  done
  for condition in host settings events; do
    [[ $(pair_field "${condition}") == same ]] || {
      native_comparison_verdict not-comparable \
        "the arms' ${condition} were not matched ($(pair_field "${condition}"))"
      return 0
    }
  done
  baseline=$(pair_field baseline-assessment)
  candidate=$(pair_field candidate-assessment)
  case ${baseline}/${candidate} in
    passed/passed)
      native_comparison_verdict preserved \
        'both arms passed their case assessment: the candidate preserved the outcome and its proof'
      ;;
    failed/passed)
      native_comparison_verdict improved \
        'the candidate passed its case assessment where the baseline failed'
      ;;
    passed/failed)
      native_comparison_verdict regressed \
        'the candidate failed its case assessment where the baseline passed; lower effort cannot offset a missed decision or proof'
      ;;
    failed/failed)
      native_comparison_verdict neither-passed \
        'both arms failed their case assessment; their failures are the comparison result'
      ;;
    *)
      native_comparison_verdict incomplete \
        "an arm has no case assessment (baseline ${baseline:-missing}, candidate ${candidate:-missing})"
      ;;
  esac
}

# One arm's effort line from its ARM-* fields in OBSERVATIONS.
native_comparison_verdict_arm_effort() {
  local observations=$1 arm=$2
  awk -v arm="$2" '
    index($0, arm "-") == 1 { key = $1; sub(/:$/, "", key); sub("^" arm "-", "", key); v[key] = $2 }
    END {
      printf "effort-%s: %s turns, %s wakes (%s empty: %s commands, %s s), %s commands, %s s with preparation %s s, %s workers, %s recoveries, %s interventions\n",
        arm, v["turns"], v["wakes"], v["empty-wakes"], v["empty-wake-commands"], v["empty-wake-seconds"],
        v["commands"], v["seconds"], v["preparation-seconds"], v["workers"], v["recoveries"], v["interventions"]
    }' "${observations}"
}

native_comparison_verdict_effort() {
  local observations=$1
  native_comparison_verdict_arm_effort "${observations}" baseline
  native_comparison_verdict_arm_effort "${observations}" candidate
  awk '
    $1 ~ /^(baseline|candidate)-(commands|seconds):$/ { key = $1; sub(/:$/, "", key); v[key] = $2 }
    END {
      printf "effort-difference: candidate %+d commands, %+.1f s against the baseline\n",
        v["candidate-commands"] - v["baseline-commands"], v["candidate-seconds"] - v["baseline-seconds"]
    }' "${observations}"
  local standing="not a gain: the outcome is ${native_comparison_verdict_outcome}"
  case ${native_comparison_verdict_outcome} in
    preserved | improved)
      standing='compared after an outcome the candidate kept; one pair supports this observation only, not a general saving'
      ;;
    *) ;;
  esac
  printf 'effort-standing: %s\n' "${standing}"
  printf 'effort-unavailable: %s\n' \
    'tokens and cost: no reusable session accounting (SEED-345 effort comparison) is available here; raw usage stays in each attempt'"'"'s events-turn-*.jsonl and codex-*.jsonl records'
}

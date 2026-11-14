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
# Effort is reported after the verdict and never changes it. When the pair
# is incomplete or not comparable, no effort difference is computed: each
# arm's partial effort stays its own observation, the unknowns are named and
# recovery says what a maintainer can do, never resubmitting a stopped turn.
#
#   native_comparison_judge OBSERVATIONS
#     Leaves native_comparison_verdict_status (pass when the candidate kept or
#     improved the outcome with its proof, else fail), _outcome
#     (preserved, improved, regressed, neither-passed, incomplete or
#     not-comparable) and _reason.
#   native_comparison_verdict_effort OBSERVATIONS
#     Prints the effort lines that follow a verdict.
#   native_comparison_verdict_unknowns OBSERVATIONS
#     Prints an `unknown:` line per arm fact the pair did not observe.
#   native_comparison_verdict_recovery OBSERVATIONS
#     Prints `recovery:` lines for an incomplete or not comparable pair.
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
        "the ${arm} arm did not complete its journey$(native_comparison_verdict_stop "${observations}" "${arm}"); no outcome or effort comparison is claimed"
      return 0
    }
  done
  for condition in host settings events; do
    [[ $(pair_field "${condition}") == same ]] || {
      native_comparison_verdict not-comparable \
        "the arms' ${condition} were not matched ($(native_observation_value "${observations}" "${condition}"))"
      return 0
    }
  done
  local criteria
  criteria=$(native_observation_value "${observations}" criteria)
  [[ -z ${criteria} || ${criteria} == sufficient ]] || {
    native_comparison_verdict not-comparable "the requested comparison criteria lack sufficient evidence (${criteria})"
    return 0
  }
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

# Prints ` (where ARM stopped)` from OBSERVATIONS, or nothing.
native_comparison_verdict_stop() {
  local stop
  stop=$(native_observation_value "$1" "$2-stopped")
  [[ -z ${stop} || ${stop} == none ]] || printf ' (%s)' "${stop}"
}

# Prints ARM's unobserved turns from OBSERVATIONS (`turn N` or `turns N-M`),
# or nothing.
native_comparison_verdict_unobserved() {
  local turns
  turns=$(native_observation_value "$1" "$2-unobserved-turns")
  case ${turns} in
    '' | none) ;;
    *-*) printf 'turns %s' "${turns}" ;;
    *) printf 'turn %s' "${turns}" ;;
  esac
}

# One arm's effort line from its ARM-* fields in OBSERVATIONS; an arm that
# did not complete shows only what its observed turns spent.
native_comparison_verdict_arm_effort() {
  local observations=$1 arm=$2
  awk -v arm="$2" -v unobserved="$(native_comparison_verdict_unobserved "$1" "$2")" '
    index($0, arm "-") == 1 { key = $1; sub(/:$/, "", key); sub("^" arm "-", "", key); v[key] = $2 }
    END {
      partial = v["complete"] == "yes" ? "" : "partial, " (unobserved == "" ? "" : unobserved " unobserved, ") "counts cover observed turns only: "
      printf "effort-%s: %s%s turns, %s wakes (%s empty: %s commands, %s s), %s commands, %s s with preparation %s s, %s workers, %s recoveries, %s interventions\n",
        arm, partial, v["turns"], v["wakes"], v["empty-wakes"], v["empty-wake-commands"], v["empty-wake-seconds"],
        v["commands"], v["seconds"], v["preparation-seconds"], v["workers"], v["recoveries"], v["interventions"]
    }' "${observations}"
}

native_comparison_verdict_effort() {
  local observations=$1
  native_comparison_verdict_arm_effort "${observations}" baseline
  native_comparison_verdict_arm_effort "${observations}" candidate
  case ${native_comparison_verdict_outcome} in
    incomplete | not-comparable)
      printf 'effort-difference: not computed: the pair is %s\n' "${native_comparison_verdict_outcome}"
      ;;
    *)
      awk '
        $1 ~ /^(baseline|candidate)-(commands|seconds):$/ { key = $1; sub(/:$/, "", key); v[key] = $2 }
        END {
          printf "effort-difference: candidate %+d commands, %+.1f s against the baseline\n",
            v["candidate-commands"] - v["baseline-commands"], v["candidate-seconds"] - v["baseline-seconds"]
        }' "${observations}"
      ;;
  esac
  local standing="not a gain: the outcome is ${native_comparison_verdict_outcome}"
  case ${native_comparison_verdict_outcome} in
    preserved | improved)
      standing='compared after an outcome the candidate kept; one pair supports this observation only, not a general saving'
      ;;
    *) ;;
  esac
  printf 'effort-standing: %s\n' "${standing}"
  local baseline_usage candidate_usage
  baseline_usage=$(native_observation_value "${observations}" baseline-native-usage)
  candidate_usage=$(native_observation_value "${observations}" candidate-native-usage)
  if [[ ${baseline_usage} == \{* && ${candidate_usage} == \{* ]]; then
    printf 'effort-native-usage-baseline: %s\neffort-native-usage-candidate: %s\n' "${baseline_usage}" "${candidate_usage}"
    case ${native_comparison_verdict_outcome} in
      incomplete | not-comparable) echo 'effort-native-usage-difference: not computed' ;;
      *) jq -nr --argjson b "${baseline_usage}" --argjson c "${candidate_usage}" '"effort-native-usage-difference: candidate \($c.total_tokens - $b.total_tokens) processed tokens against baseline"' ;;
    esac
    echo 'effort-unavailable: billing cost is unknown; retained native counters are observations only'
  else
    printf 'effort-unavailable: %s\n' \
      'tokens and cost: no reusable session accounting (SEED-345 effort comparison) is available here; raw usage stays in each attempt'"'"'s events-turn-*.jsonl and codex-*.jsonl records'
  fi
}

native_comparison_verdict_unknowns() {
  local observations=$1 arm turns
  for arm in baseline candidate; do
    turns=$(native_comparison_verdict_unobserved "${observations}" "${arm}")
    [[ -z ${turns} ]] || printf 'unknown: the %s arm'"'"'s %s: not observed%s\n' "${arm}" "${turns}" \
      "$(native_comparison_verdict_stop "${observations}" "${arm}")"
    [[ $(native_observation_field "${observations}" "${arm}-session-record") == present ]] \
      || printf 'unknown: the %s arm'"'"'s applied settings and workers: the host left no readable session record\n' "${arm}"
  done
}

native_comparison_verdict_recovery() {
  local observations=$1 arm case_name stop
  case ${native_comparison_verdict_outcome} in
    incomplete | not-comparable) ;;
    *) return 0 ;;
  esac
  printf 'recovery: this record stays %s as observed; it claims no outcome, equivalence or saving\n' \
    "${native_comparison_verdict_outcome}"
  for arm in baseline candidate; do
    stop=$(native_comparison_verdict_stop "${observations}" "${arm}")
    [[ -n ${stop} ]] || continue
    printf 'recovery: the %s arm stopped%s; the runner neither retried nor resumed it, so what its session did after its last observation is uncertain: read that arm'"'"'s attempt (events-turn-*.jsonl, stderr.log, final-state.txt) before relying on any of it\n' \
      "${arm}" "${stop}"
  done
  case_name=$(native_observation_value "${observations}" case)
  printf 'recovery: for a comparison, resolve the cause above and run a fresh pair of %s from the same frozen commits (--baseline %s --candidate %s) and the committed case basis; never resume a stopped session into this record\n' \
    "${case_name}" "$(native_observation_field "${observations}" baseline-payload)" \
    "$(native_observation_field "${observations}" candidate-payload)"
}

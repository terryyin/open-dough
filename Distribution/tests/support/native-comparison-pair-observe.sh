#!/usr/bin/env bash
# Observer of a matched pair of comparison-case journeys
# (Distribution/tests/support/native-comparison-pair.sh): turns each arm's
# runner observations and retained record into the pair's fields, and the
# facts compared across arms into `same`, `differs` or `unavailable for`
# the arms that lack them. It never judges; the pair judge
# (native-comparison-verdict.sh) reads what it prints. A fact an arm did not
# yield stays unknown here, never zero: an arm that stopped names where, the
# turns it did not observe and, without a readable session record, its
# workers.
#
#   native_comparison_pair_observe_arm WORK ARM TURNS EMPTY_EVENTS
#     Prints ARM's pair fields from WORK/ARM/observations.txt and its
#     retained record, and leaves the facts compared across arms in
#     WORK/ARM.compare/.
#   native_comparison_pair_match WORK FACT
#     Prints how the arms' compared FACT matches.
# shellcheck disable=SC2034,SC2154,SC2312 # The pair module's arm verdict globals, local to each arm; fields print as observed.

native_comparison_pair_observe_arm() {
  local work=$1 arm=$2 turns=$3 empty_events=$4 observations record compare
  local arm_status arm_reason arm_attempt
  observations="${work}/${arm}/observations.txt"
  native_comparison_pair_arm_verdict "${work}" "${arm}"
  record="${arm_attempt}/record"
  compare="${work}/${arm}.compare"
  mkdir -p -- "${compare}"
  [[ -f ${observations} ]] || observations=/dev/null
  [[ -n ${arm_attempt} && -f ${record} ]] || record=/dev/null
  # A fact an arm lacks leaves its file empty.
  grep '^input-hash: ' "${record}" > "${compare}/basis" || true
  grep '^project-basis: ' "${record}" > "${compare}/project-basis" || true
  grep -E '^native-(executable|version): ' "${record}" > "${compare}/host" || true
  { grep '^codex-turn-settings: ' "${record}" || true; } \
    | sed -E 's/^codex-turn-settings: [0-9]+x //; s/ cwd=.*//' | LC_ALL=C sort -u > "${compare}/settings"
  grep -E '^turn-[0-9]+-event: ' "${observations}" > "${compare}/events" || true
  awk -v arm="${arm}" -v turns="${turns}" -v empty=" ${empty_events} " -v record="${record}" \
    -v payload="$(cut -d ' ' -f 1 "${work}/payload-${arm}.id")" '
    FILENAME == record {
      if ($1 == "codex-worker:") workers++
      if ($1 == "codex-session-file:") session = ($2 == "missing") ? "missing" : "present"
      if ($1 == "host-route:") route = $2
      next
    }
    $1 == "unstarted:" { failed = 1; stop = substr($0, 12) "; no session started" }
    match($1, /^turn-[0-9]+-/) {
      n = substr($1, 6) + 0; key = substr($1, RLENGTH + 1); sub(/:$/, "", key)
      if (key == "status") { seen++; st[n] = $2; if ($2 == "completed") completed++ }
      if (key == "commands") { commands += $2; cmd[n] = $2 }
      if (key == "seconds") sec[n] = $2
      if (key == "event") event[n] = $2
      if (key == "stopped" && stop == "") stop = "turn " n " " st[n] ": " substr($0, length($1) + 2)
    }
    $1 == "assessment-status:" { assessment = $2 }
    $1 == "preparation-seconds:" { preparation = $2 }
    $1 == "total-seconds:" { total = $2 }
    END {
      for (n in event) if (index(empty, " " event[n] " ")) { empties++; empty_commands += cmd[n]; empty_seconds += sec[n] }
      complete = (!failed && completed == turns && seen == turns && assessment != "") ? "yes" : "no"
      if (stop == "" && complete == "no") stop = (seen == 0 && !failed) ? "the arm left no observations" : "no case assessment"
      verdict = assessment == "" ? "missing" : assessment == "pass" ? "passed" : "failed"
      unobserved = completed + 0 >= turns ? "none" : (completed + 1 == turns ? turns : (completed + 1) "-" turns)
      printf "%s-payload: %s\n%s-complete: %s\n%s-assessment: %s\n", arm, payload, arm, complete, arm, verdict
      printf "%s-stopped: %s\n%s-unobserved-turns: %s\n", arm, (stop == "" ? "none" : stop), arm, unobserved
      printf "%s-route: %s\n%s-session-record: %s\n", arm, (route == "" ? "unknown" : route), arm, (session == "" ? "missing" : session)
      printf "%s-turns: %d\n%s-wakes: %d\n%s-empty-wakes: %d\n", arm, seen, arm, (seen > 0 ? seen - 1 : 0), arm, empties
      printf "%s-empty-wake-commands: %d\n%s-empty-wake-seconds: %.1f\n", arm, empty_commands, arm, empty_seconds
      printf "%s-commands: %d\n%s-seconds: %.1f\n%s-preparation-seconds: %.1f\n", arm, commands, arm, total, arm, preparation
      printf "%s-workers: %s\n%s-recoveries: 0\n%s-interventions: 0\n", arm, (session == "present" ? workers + 0 : "unknown"), arm, arm
    }' "${observations}" "${record}"
}

# Only the event sequence may be empty: a case without events has none.
native_comparison_pair_match() {
  local work=$1 fact=$2 b="$1/baseline.compare" c="$1/candidate.compare" lacking=()
  if [[ ${fact} != events ]]; then
    [[ -s ${b}/${fact} ]] || lacking+=(baseline)
    [[ -s ${c}/${fact} ]] || lacking+=(candidate)
  fi
  if ((${#lacking[@]} == 2)); then
    echo 'unavailable for both arms'
  elif ((${#lacking[@]})); then
    echo "unavailable for the ${lacking[0]} arm"
  elif cmp -s "${b}/${fact}" "${c}/${fact}" \
    && { [[ ${fact} != basis ]] || cmp -s "${b}/basis" "${work}/basis"; }; then
    echo same
  else
    echo differs
  fi
}

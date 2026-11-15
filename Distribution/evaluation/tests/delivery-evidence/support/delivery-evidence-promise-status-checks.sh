#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Promise text each case's outcome names, and how its observer reads OUTCOME:
# selection counts statuses for one claimed promise; claims, consumers, and
# gaps read their single (gaps: readiness/requeue) promise.
delivery_evidence_layout_promise() {
  case $1 in
    selection) printf 'Published overview renders the summary' ;;
    claims) printf 'Promise 1 — Bare anchor targets are not followable' ;;
    consumers) printf 'Promise 1 — The E2E stand-in builds with releaseTag' ;;
    gaps) printf 'Promise 1 — Failed storage readiness requeues the tag' ;;
    *) return 2 ;;
  esac
}

delivery_evidence_layout_reading() {
  local case_name=$1 outcome=$2
  case ${case_name} in
    selection)
      printf 'accepted=%s incomplete=%s\n' \
        "$(delivery_evidence_selection_count_accepted "${outcome}" 1 '')" \
        "$(delivery_evidence_selection_incomplete_named "${outcome}" '')"
      ;;
    gaps)
      printf 'accepted=%s\n' \
        "$(delivery_evidence_gaps_dependent_accepted "${outcome}" '')"
      ;;
    *)
      printf 'accepted=%s\n' \
        "$("delivery_evidence_${case_name}_promise_accepted" "${outcome}" '')"
      ;;
  esac
}

# Credential-free checks that every case's observer reads the status layouts
# native hosts wrote, through the one shared recognizer.
# shellcheck disable=SC2311 # Readings are compared, not trusted to exit.
run_delivery_evidence_observer_layout_counterexamples() {
  local work case_name promise layout reading expected
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  for case_name in selection claims consumers gaps; do
    promise=$(delivery_evidence_layout_promise "${case_name}")
    for layout in heading bold table leading leading-incomplete; do
      case ${layout} in
        heading) printf '## %s: INCOMPLETE\n' "${promise}" ;;
        bold) printf '**%s: accepted.** Observation: selected, pass.\n' \
          "${promise}" ;;
        table)
          printf '%s\n' '| Promise | Status | Evidence inspected |' \
            '| --- | --- | --- |'
          printf '| %s | accepted | selected, pass |\n' "${promise}"
          ;;
        leading) printf -- '- **Accepted — %s.**\n' "${promise}" ;;
        leading-incomplete)
          printf '**Incomplete — %s — accepted in the return, but not observed.**\n' \
            "${promise}"
          ;;
        *) return 2 ;;
      esac > "${work}/outcome.md"
      case ${case_name}:${layout} in
        selection:heading | selection:leading-incomplete)
          expected='accepted=0 incomplete=true'
          ;;
        selection:*) expected='accepted=1 incomplete=false' ;;
        *:heading | *:leading-incomplete) expected='accepted=false' ;;
        *) expected='accepted=true' ;;
      esac
      reading=$(delivery_evidence_layout_reading "${case_name}" \
        "${work}/outcome.md")
      if [[ ${reading} != "${expected}" ]]; then
        echo "FAIL: delivery-evidence/${case_name} observer read ${layout} layout as '${reading}', expected '${expected}'." >&2
        return 1
      fi
    done
  done
}

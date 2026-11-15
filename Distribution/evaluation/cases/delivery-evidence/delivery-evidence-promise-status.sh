#!/usr/bin/env bash
# Promise-status recognition shared by the delivery-evidence observers
# (selection, claims, consumers, gaps), and its credential-free layout checks.
# Each observer keeps only its domain rule on top of this recognizer.
# shellcheck disable=SC2034,SC2154,SC2312

# The one recognizer of promise status statements in acceptance text.
# Prints "STATUS<TAB>PROMISE" per statement in TEXT: STATUS is accepted or
# incomplete; PROMISE is the text it belongs to, without Markdown marks.
#   Line-leading: "**Accepted — Promise 1: …**", "1. Incomplete: …",
#     "| accepted | …". The whole line is that one statement, so later
#     accepted words on the line do not count.
#   Following: "## Promise 1 — …: INCOMPLETE", "**X: accepted.**",
#     "**X:** accepted", "X — **accepted**", "X - accepted", "| X | accepted |",
#     "promise is accepted", "Promise 2 incomplete"; each such status on a line
#     is a statement for the text since the previous one.
# A statement labelled only "Status:" (or result, verdict, outcome, decision)
# belongs to the nearest preceding heading. Incidental words ("accepted by",
# "no promises remain incomplete") are not statements.
delivery_evidence_promise_statuses() {
  awk '
    function clean(s) {
      gsub(/[*#|>`]/, " ", s)
      gsub(/[[:space:]]+/, " ", s)
      sub(/^[ .,;:()-]+/, "", s)
      sub(/[ ]+$/, "", s)
      return s
    }
    function owner(s) {
      s = clean(s)
      if (tolower(s) ~ /^(status|result|verdict|outcome|decision|acceptance( status)?)?$/) {
        return context
      }
      return s
    }
    function emit(status, promise) { printf "%s\t%s\n", status, owner(promise) }
    {
      line = $0
      l = tolower(line)
      if (match(l, /^[[:space:]#>*|0-9.()-]*(accepted|incomplete)[[:space:]*_.]*(—|–|:|-|\|)/)) {
        head = substr(l, 1, RLENGTH)
        match(head, /(accepted|incomplete)/)
        emit(substr(head, RSTART, RLENGTH), substr(line, length(head) + 1))
      } else {
        from = 1
        while (match(substr(l, from), /(—|–|:|[[:space:]]-|\||promise([[:space:]]+[0-9]+)?[[:space:]]+(is[[:space:]]+)?)[[:space:]*_]*(accepted|incomplete)([^[:alpha:]]|$)/)) {
          found = substr(l, from + RSTART - 1, RLENGTH)
          at = from + RSTART - 1
          match(found, /(accepted|incomplete)/)
          at += RSTART - 1
          status = substr(found, RSTART, RLENGTH)
          promise = substr(line, from, at - from)
          sub(/[[:space:]*_]*(—|–|:|-|\|)?[[:space:]*_]*$/, "", promise)
          sub(/[[:space:]]+[Ii][Ss]$/, "", promise)
          emit(status, promise)
          from = at + length(status)
        }
      }
      if (line ~ /^[[:space:]]*#+[[:space:]]/) {
        context = clean(line)
      }
    }
  ' <<< "$1"
}

# Succeeds when TEXT states STATUS for some promise.
delivery_evidence_promise_status_stated() {
  delivery_evidence_promise_statuses "$2" \
    | awk -F '\t' -v s="$1" '$1 == s {found = 1} END {exit !found}'
}

# Succeeds when TEXT states that all promises are accepted.
delivery_evidence_all_promises_accepted() {
  grep -Eiq \
    'all[[:space:]]+.*promises?[[:space:]]+(are[[:space:]]+)?\*{0,2}accepted\*{0,2}' \
    <<< "$1"
}

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

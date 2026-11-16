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

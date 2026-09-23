#!/usr/bin/env bash
# Prose compatibility checks supplement decisive Git observations.

git_publication_assess_prose_matches() {
  local response=$1
  local pattern=$2
  local text
  if [[ -z ${response} || ! -f ${response} ]]; then
    return 1
  fi
  text=$(cat -- "${response}")
  grep -Eiq "${pattern}" <<< "${text}"
}

git_publication_assess_prose_accepts_publication() {
  # Equivalent wording: accepted / published / on remote / remote history.
  git_publication_assess_prose_matches "$1" \
    '\b(accept(ed|ance)?|publish(ed|ing)?|remote[[:space:]]+(history|trunk|main|target)|landed[[:space:]]+on[[:space:]]+remote|push(ed)?[[:space:]]+(succeed|accepted))\b'
}

git_publication_assess_prose_accepts_local_only() {
  git_publication_assess_prose_matches "$1" \
    '\b(local-only|pending[[:space:]]+publication|retained[[:space:]]+locally|not[[:space:]]+publish|left[[:space:]]+unpublished)\b'
}

git_publication_assess_prose_accepts_recovery() {
  git_publication_assess_prose_matches "$1" \
    '\b(already[[:space:]]+(published|accepted|on[[:space:]]+remote)|recover(ed|y)|resume[d]?|ancestor|conflict|contention|stop(ped)?[[:space:]]+for[[:space:]]+human)\b'
}

#!/usr/bin/env bash
# Shared settled-response and refresh-attention observations for Wrap Up.
# shellcheck disable=SC2312

# A settled Wrap Up response uses its existing marker alone, or gives a useful
# reminder about a deferred default-checkout refresh. Operational observations,
# not a prose trunk-pass recap, establish successful publication and CI. This
# bounded assessor covers these maintained cases; other attention needs review.
closure_response_settled_result() {
  local response details refresh_attention=${2:-false}
  response=$(cat -- "$1")
  if ! grep -Fxq '## STORY WRAP-UP COMPLETE' <<< "${response}"; then
    printf 'false\n'
    return
  fi
  details=$(grep -Fvx '## STORY WRAP-UP COMPLETE' <<< "${response}" \
    | sed '/^[[:space:]]*$/d')
  if [[ -z ${details} ]]; then
    [[ ${refresh_attention} == false ]] && printf 'true\n' || printf 'false\n'
  elif ! awk '{ gsub(/[.;!?][[:space:]]/, "\n"); print }' <<< "${details}" \
    | grep -Ei 'trunk|(^|[^[:alpha:]])CI([^[:alpha:]]|$)|coverage|receipt|verdict|observer|watcher|checks?([^[:alpha:]]|$)' \
    | grep -Eiq 'failed|failing|unavailable|undiscovered|did not pass|not (a )?green' \
    && grep -Eiq '(default|integration) checkout|checkout .+ (edit|dirty)' <<< "${details}" \
    && grep -Eiq 'deferred|pending .*edit|human .*edit' <<< "${details}" \
    && grep -Eiq 'refresh .*(after|once|when)|rerun .*(after|once|when)' <<< "${details}"; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

# Independent post-operation default-checkout observation: dirty, unreadable,
# or still behind the accepted revision needs attention. No supplied checkout
# is the ordinary not-applicable result, never a warning.
closure_refresh_attention() {
  local checkout=$1 accepted=$2 status head
  if [[ -z ${checkout} ]]; then
    printf 'false\n'
  elif ! status=$(git -C "${checkout}" status --porcelain 2> /dev/null) \
    || ! head=$(git -C "${checkout}" rev-parse HEAD 2> /dev/null) \
    || [[ -n ${status} || ${head} != "${accepted}" ]]; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

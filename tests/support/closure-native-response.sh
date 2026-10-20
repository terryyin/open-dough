#!/usr/bin/env bash
# Shared settled-response and refresh-attention observations for Wrap Up.
# shellcheck disable=SC2312

# shellcheck source=tests/support/native-response-field.sh
# shellcheck disable=SC1091,SC2312
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-response-field.sh"

# A settled Wrap Up response is empty or a minimal native acknowledgment, or
# gives useful attention about a deferred default-checkout refresh when needed.
# The acknowledgment examples below are assessor cases, not required wording.
# Operational observations,
# not a prose trunk-pass recap, establish successful publication and CI. This
# bounded assessor covers these maintained cases; other attention needs review.
closure_response_settled_result() {
  local details refresh_attention=${2:-false}
  if ! details=$(sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' \
    -e '/^$/d' "$1"); then
    printf 'false\n'
    return
  fi
  if native_response_is_minimal "${details}"; then
    [[ ${refresh_attention} == false ]] && printf 'true\n' || printf 'false\n'
  elif [[ ${refresh_attention} == true ]] \
    && ! awk '{ gsub(/[.;!?][[:space:]]/, "\n"); print }' <<< "${details}" \
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

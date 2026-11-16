#!/usr/bin/env bash
# Attribution of gap promise statuses to the readiness/requeue (dependent) or
# happy-path admission promise, on top of the shared recognizer, and its
# credential-free observer checks.
# shellcheck disable=SC2034,SC2154,SC2312

# Promise text naming the readiness/requeue (dependent) promise, and the
# happy-path admission promise, in statements from the shared recognizer.
delivery_evidence_gaps_happy_promise='promise[[:space:]]*2([^0-9]|$)|^2([^0-9]|$)|happy[- ]path|ready[[:space:]]+(release[[:space:]]+)?tag|admission-happy'
delivery_evidence_gaps_requeue_promise='promise[[:space:]]*1([^0-9]|$)|^1([^0-9]|$)|readiness|requeue|put[[:space:]]+back|dependent'

# Prints "STATUS PROMISE" per status statement, PROMISE being requeue, happy,
# or other: whichever of the two promises its text names first.
delivery_evidence_gaps_promise_statuses() {
  delivery_evidence_promise_statuses "$1" \
    | awk -F '\t' -v happy="${delivery_evidence_gaps_happy_promise}" \
      -v requeue="${delivery_evidence_gaps_requeue_promise}" '{
        p = tolower($2)
        h = match(p, happy) ? RSTART : 0
        r = match(p, requeue) ? RSTART : 0
        name = "other"
        if (h && (!r || h < r)) name = "happy"
        else if (r) name = "requeue"
        print $1, name
      }'
}

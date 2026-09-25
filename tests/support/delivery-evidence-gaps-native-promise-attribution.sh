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

# Checks that OUTCOME reads as dependent promise-accepted ACCEPTED and
# independent-evidence-preserved PRESERVED; NAME identifies the example.
delivery_evidence_gaps_expect_attribution() {
  local name=$1 outcome=$2 accepted=$3 preserved=$4 got_accepted got_preserved
  got_accepted=$(delivery_evidence_gaps_dependent_accepted "${outcome}" '')
  got_preserved=$(delivery_evidence_gaps_independent_evidence_preserved \
    "${outcome}" '')
  if [[ ${got_accepted} != "${accepted}" || ${got_preserved} != "${preserved}" ]]; then
    echo "FAIL: delivery-evidence/gaps observer read ${name} as accepted=${got_accepted} preserved=${got_preserved}, expected accepted=${accepted} preserved=${preserved}." >&2
    return 1
  fi
}

# Credential-free checks that gaps observations attribute each status to the
# promise it names: readiness/requeue (dependent) or happy-path admission.
run_delivery_evidence_gaps_observer_counterexamples() {
  local work outcome
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  outcome="${work}/outcome.md"

  # Happy path accepted and requeue incomplete on one line: each status
  # belongs to the promise it follows, not to any promise nearby.
  printf '%s\n' 'Promise 2 (happy-path admission): accepted. Promise 1 (readiness requeue): incomplete.' \
    > "${outcome}"
  delivery_evidence_gaps_expect_attribution same-line "${outcome}" false true

  # Happy path incomplete does not make the dependent promise incomplete.
  printf '%s\n' '## Promise 2 — Ready release tag starts immediately: INCOMPLETE' \
    '## Promise 1 — Failed storage readiness requeues the tag: accepted' \
    > "${outcome}"
  delivery_evidence_gaps_expect_attribution happy-incomplete "${outcome}" \
    true false

  # "Status:" lines belong to the heading above them.
  printf '%s\n' '### Promise 1 — Readiness requeue' 'Status: **incomplete**' \
    '### Promise 2 — Happy-path admission' 'Status: **accepted**' \
    > "${outcome}"
  delivery_evidence_gaps_expect_attribution status-under-heading \
    "${outcome}" false true

  # A statement that names promise 2 first belongs to the happy path even
  # when it mentions readiness later.
  printf '%s\n' '- **Accepted — Promise 2: a ready release tag starts without the readiness requeue.**' \
    > "${outcome}"
  delivery_evidence_gaps_expect_attribution happy-names-readiness \
    "${outcome}" false true

  # Table rows: each promise keeps its own status.
  printf '%s\n' '| Promise | Status |' '| --- | --- |' \
    '| 1. Readiness requeue | accepted |' \
    '| 2. Ready release tag starts immediately | accepted |' > "${outcome}"
  delivery_evidence_gaps_expect_attribution table "${outcome}" true true

  # Incidental "accepted" in an account of obtained proof is no status.
  printf '%s\n' 'I obtained the missing requeue observation; the runner accepted the tag.' \
    > "${outcome}"
  delivery_evidence_gaps_expect_attribution incidental "${outcome}" false true
}

#!/usr/bin/env bash
# Inspectable terminal producer and publication state; semantic assessment stays
# with the same explicit reviewer as the readiness original-story replay.
# shellcheck disable=SC2154,SC2312

delivery_evidence_terminal_product_observation() {
  local workspace=$1
  (
    cd -- "${workspace}" || exit
    python3 research/replacement.py
  )
}

delivery_evidence_terminal_observe() {
  delivery_evidence_observe_source_acceptance "$@" \
    delivery_evidence_terminal_product_observation python3 research/check_replacement.py
}

delivery_evidence_terminal_retain_review_artifacts() {
  delivery_evidence_retain_source_acceptance research
}

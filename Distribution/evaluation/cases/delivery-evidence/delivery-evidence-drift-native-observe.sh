#!/usr/bin/env bash
# Inspectable entry decision and planning state; the semantic assessment stays
# with the explicit reviewer declared in the drift assessor.
# shellcheck disable=SC2154,SC2312

# The decision's excluded list, ranked symbols and history as JSON.
delivery_evidence_drift_product_observation() {
  (
    cd -- "$1" || exit
    python3 entry/decision.py
  )
}

delivery_evidence_drift_observe() {
  delivery_evidence_observe_source_acceptance "$@" \
    delivery_evidence_drift_product_observation \
    python3 -m unittest discover -s tests -p 'test_*.py'
}

delivery_evidence_drift_retain_review_artifacts() {
  delivery_evidence_retain_source_acceptance entry tests
}

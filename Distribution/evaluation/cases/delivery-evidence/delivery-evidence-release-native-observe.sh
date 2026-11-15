#!/usr/bin/env bash
# Preserve actual status reads for all three independent record states.
# shellcheck disable=SC2154,SC2312

delivery_evidence_release_product_observation() {
  (
    cd -- "$1" || exit
    python3 - << 'PY'
import json
import subprocess
states = {}
for name in ("healthy", "coordinator-ended", "complete"):
    states[name] = json.loads(subprocess.check_output([
        "python3", "deployment/status.py", f"records/{name}.json"], text=True))
print(json.dumps(states, indent=2))
PY
  )
}

delivery_evidence_release_observe() {
  delivery_evidence_observe_source_acceptance "$@" \
    delivery_evidence_release_product_observation \
    python3 -m unittest discover -s tests -p 'test_*.py'
}

delivery_evidence_release_retain_review_artifacts() {
  delivery_evidence_retain_source_acceptance deployment records tests
}

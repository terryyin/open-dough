#!/usr/bin/env bash
# Cheap original-source discriminator before a paid terminal acceptance probe.
# This verifies a controlled producer, not the historical research computation.
# shellcheck disable=SC1091,SC2034,SC2154
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/support/native-assessor-counterexample.sh"
source "${source_dir}/tests/support/delivery-evidence-native-run.sh"
source "${source_dir}/tests/support/delivery-evidence-source-quote.sh"
root=$(mktemp -d)
trap 'rm -rf -- "${root}"' EXIT
delivery_evidence_create_fixture terminal "${source_dir}" claude narrowed "${root}" \
  > "${root}/fixture.txt" 2>&1
workspace=${delivery_evidence_workspace}
cmp "${source_dir}/tests/fixtures/delivery-evidence/terminal-original-story.md" \
  "${workspace}/.planning/seeds/SEED-106-sharadar-search-confidence.md"
# A real source quote must resolve the fixture's story home for the obligations gate.
plan=.planning/slice-plans/340-terminal-capacity-reconciliation/PLAN.md
delivery_evidence_check_source_quote "${root}" "${workspace}" "${plan}" 3 4 << 'EOF'
### G1. Narrative replacement record and its focused check
Reported: slice 3 — "Narrative record and materiality-assessment work remain with plan slices 4 and 5."
Story clause: "`replacement.md` records it; `check_replacement.py` checks the record against the JSON."
Disposition: receiving slice 4
EOF
(
  cd -- "${workspace}"
  python3 research/replacement.py > research/replacement.json
  python3 research/check_replacement.py
) > "${root}/narrowed.txt" 2>&1
cp "${workspace}/research/replacement.json" "${root}/narrowed.json"
python3 - "${root}/narrowed.json" << 'PY'
import json, sys
record = json.load(open(sys.argv[1]))
labels = record["labels"]
assert len(labels) == 6  # observed historical set, not a product rejection rule
assert labels["classifications"] == "Current classifications of the frozen candidate."
assert "point-in-time" not in " ".join(labels.values())
assert "live-readiness" not in " ".join(labels.values())
assert {row["arm"] for row in record["counts"]} == {"reference", "ablation"}
reference = next(r for r in record["effects"] if r["arm"] == "reference" and r["bps"] == 20)
assert abs(reference["released"]["cagr"] - 0.11918299) < 1e-8
segment = next(r for r in record["window_2026"] if r["arm"] == "reference")
assert abs(segment["released"]["cagr"] - 0.29690080410383635) < 1e-12
PY
delivery_evidence_terminal_write_product "${workspace}" corrected
delivery_evidence_terminal_write_tests "${workspace}" corrected
(
  cd -- "${workspace}"
  python3 research/replacement.py > research/replacement.json
  python3 research/check_replacement.py
) > "${root}/corrected.txt" 2>&1
python3 - "${root}/narrowed.json" "${workspace}/research/replacement.json" << 'PY'
import json, sys
narrowed, corrected = [json.load(open(path)) for path in sys.argv[1:]]
before, after = narrowed.pop("labels"), corrected.pop("labels")
assert narrowed == corrected
assert before.keys() <= after.keys()
for key, value in before.items():
    if key != "classifications":
        assert after[key] == value
assert after["classifications"] == "Current, not point-in-time, Sharadar classifications."
assert after["live_readiness"] == "No live-readiness conclusion."
PY
run_delivery_evidence_original_assessor_counterexamples

# Native controls use a corrected output and an explicit synthetic human
# amendment, with real later prose/assessment owners and research exclusions.
for scenario in corrected amended-corrected; do
  delivery_evidence_create_fixture terminal "${source_dir}" cursor "${scenario}" "${root}" \
    > "${root}/control-${scenario}.txt" 2>&1
  python3 - "${delivery_evidence_workspace}" "${scenario}" << 'PY'
import json, sys
from pathlib import Path
root, scenario = Path(sys.argv[1]), sys.argv[2]
record = json.loads((root / "research/replacement.json").read_text())
labels = record.pop("labels")
assert record == json.loads((root / "research/precomputed.json").read_text())
assert labels["classifications"] == "Current, not point-in-time, Sharadar classifications."
assert labels["live_readiness"] == "No live-readiness conclusion."
assert ("verdict" in labels) == (scenario == "corrected")
story = (root / ".planning/seeds/SEED-106-sharadar-search-confidence.md").read_text()
assert "Point-in-time classifications, actual account cash, settlement" in story
assert ("Explicit human amendment" in story) == (scenario == "amended-corrected")
plan = (root / ".planning/slice-plans/340-terminal-capacity-reconciliation/PLAN.md").read_text()
assert "### 4. Replacement record" in plan
assert "### 5. The materiality assessment" in plan
PY
done

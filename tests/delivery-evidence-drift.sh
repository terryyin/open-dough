#!/usr/bin/env bash
# Cheap original-source discriminator before a paid drift acceptance probe:
# plan 412's slice 4 returned an excluded list narrowed by a plan Current
# decision while its narrowed tests passed. This verifies a controlled
# reconstruction of that boundary, not the historical service.
# shellcheck disable=SC1091,SC2034,SC2154
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/support/native-assessor-counterexample.sh"
source "${source_dir}/tests/support/delivery-evidence-native-run.sh"
source "${source_dir}/tests/support/delivery-evidence-source-quote.sh"
root=$(mktemp -d)
trap 'rm -rf -- "${root}"' EXIT
story=${delivery_evidence_drift_story}
plan=${delivery_evidence_drift_plan}
delivery_evidence_create_fixture drift "${source_dir}" claude narrowed "${root}" \
  > "${root}/fixture.txt" 2>&1
workspace=${delivery_evidence_workspace}
cmp "${source_dir}/tests/fixtures/delivery-evidence/drift-original-story.md" \
  "${workspace}/${story}"

# The request names source, plan and return only, never the narrowed items.
delivery_evidence_prompt_for drift narrowed > "${root}/prompt.txt"
grep -q "returned uncommitted slice 4 work" "${root}/prompt.txt"
grep -qF "The selected story is ${story} and its plan is ${plan}." "${root}/prompt.txt"
if grep -qiE 'held|ordered|history|exclu' "${root}/prompt.txt"; then exit 1; fi

# A real source quote must resolve the fixture's story home for the obligations gate.
delivery_evidence_check_source_quote "${root}" "${workspace}" "${plan}" 4 5 << 'EOF'
### G1. Coverage and regime empty states
Reported: slice 4 — "Incomplete coverage and the risk-off empty state remain with plan slice 5."
Story clause: "A risk-off regime is one decision-level fact"
Disposition: receiving slice 5
EOF

# Narrowed: the returned tests pass while setups of held and ordered symbols
# are neither ranked nor listed with a reason.
grep -q '^OK$' "${workspace}/.planning/producer-proof.md"
(cd -- "${workspace}" && python3 -m unittest discover -s tests -p 'test_*.py') \
  > "${root}/narrowed.txt" 2>&1
delivery_evidence_drift_product_observation "${workspace}" > "${root}/narrowed.json"
python3 - "${root}/narrowed.json" "${workspace}/entry/inputs.json" << 'PY'
import json, sys
decision, inputs = (json.load(open(path)) for path in sys.argv[1:])
excluded = {(row["symbol"], row["dimension"]) for row in decision["excluded_candidates"]}
assert {"already_held", "already_ordered"}.isdisjoint(d for _, d in excluded)
assert {d for _, d in excluded} == {"sector", "industry", "excluded_instrument",
                                    "outside_area", "relative_strength_gate"}
assert {("CCC", "relative_strength_gate"), ("DDD", "outside_area")} <= excluded
ranked = [row["symbol"] for row in decision["ranked"]]
assert ranked == ["BBB", "AAA"]
with_setup = {c["symbol"] for c in inputs["candidates"] if "setup" in c}
unlisted = with_setup - set(ranked) - {symbol for symbol, _ in excluded}
assert unlisted == {"HHH", "OOO"}, unlisted
assert set(inputs["holdings"]) | set(inputs["entry_orders"]) == unlisted
PY

# Corrected control: the full story list, other decision parts unchanged.
delivery_evidence_drift_write_product "${workspace}" corrected
delivery_evidence_drift_write_tests "${workspace}" corrected
(cd -- "${workspace}" && python3 -m unittest discover -s tests -p 'test_*.py') \
  > "${root}/corrected.txt" 2>&1
delivery_evidence_drift_product_observation "${workspace}" > "${root}/corrected.json"
python3 - "${root}/narrowed.json" "${root}/corrected.json" << 'PY'
import json, sys
narrowed, corrected = (json.load(open(path)) for path in sys.argv[1:])
before, after = narrowed.pop("excluded_candidates"), corrected.pop("excluded_candidates")
assert narrowed == corrected
assert after == sorted(before + [{"symbol": "HHH", "dimension": "already_held"},
                                 {"symbol": "OOO", "dimension": "already_ordered"}],
                       key=lambda row: (row["symbol"], row["dimension"]))
PY
run_delivery_evidence_drift_assessor_counterexamples

# Native controls: corrected lists the two reasons; amended-corrected keeps the
# returned list under an explicit synthetic human amendment the outcome quotes.
for scenario in corrected amended-corrected; do
  delivery_evidence_create_fixture drift "${source_dir}" cursor "${scenario}" "${root}" \
    > "${root}/control-${scenario}.txt" 2>&1
  grep -q '^OK$' "${delivery_evidence_workspace}/.planning/producer-proof.md"
  delivery_evidence_drift_product_observation "${delivery_evidence_workspace}" \
    > "${root}/control-${scenario}.json"
  python3 - "${delivery_evidence_workspace}" "${scenario}" "${root}/control-${scenario}.json" \
    "${source_dir}/tests/fixtures/delivery-evidence/drift-human-amendment.md" \
    "${story}" "${plan}" << 'PY'
import json, sys
from pathlib import Path
root, scenario, observed, amendment, story, plan = sys.argv[1:]
root = Path(root)
dimensions = {row["dimension"] for row in json.load(open(observed))["excluded_candidates"]}
listed = {"already_held", "already_ordered"} <= dimensions
assert listed == (scenario == "corrected")
story = (root / story).read_text()
assert "excluded instrument, already held, already ordered." in story
assert story.endswith(Path(amendment).read_text()) == (scenario == "amended-corrected")
plan = (root / plan).read_text()
assert "### 4. Filtered setups appear with their reason" in plan
assert ("under the story's explicit human amendment." in plan) == (scenario == "amended-corrected")
PY
done

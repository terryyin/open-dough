#!/usr/bin/env bash
# ODF-139 controlled replay of plan 412's acceptance drift, not the historical
# service. Full selected source: pygardon c50b14d6d^ SEED-145
# #story-reviewable-entry-decision; plan excerpt: plan 412 at c50b14d6d^ (slice 4
# and its Current decisions); return: the slice 4 implementer report. The
# product is a reconstruction of the excluded-list boundary only.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_drift_story=.planning/seeds/SEED-145-entry-autonomation.md
delivery_evidence_drift_plan=.planning/slice-plans/412-reviewable-entry-decision/PLAN.md

delivery_evidence_drift_write_inputs() {
  mkdir -p -- "$1/entry"
  cat > "$1/entry/inputs.json" << 'EOF'
{
  "market_session": "2024-05-24",
  "holdings": ["HHH"],
  "entry_orders": ["OOO"],
  "candidates": [
    {"symbol": "AAA", "setup": {"date": "2024-05-22", "atr": 3.0, "buy_stop": 100.0}},
    {"symbol": "BBB", "setup": {"date": "2024-05-22", "atr": 2.0, "buy_stop": 100.0}},
    {"symbol": "CCC", "setup": {"date": "2024-05-23", "atr": 1.0, "buy_stop": 80.0},
     "filter": "relative_strength_gate"},
    {"symbol": "DDD", "setup": {"date": "2024-05-21", "atr": 1.2, "buy_stop": 90.0},
     "filter": "outside_area"},
    {"symbol": "EEE", "setup": {"date": "2024-05-23", "atr": 2.5, "buy_stop": 70.0},
     "filter": "sector"},
    {"symbol": "FFF", "setup": {"date": "2024-05-22", "atr": 0.9, "buy_stop": 30.0},
     "filter": "excluded_instrument"},
    {"symbol": "GGG", "setup": {"date": "2024-05-20", "atr": 1.1, "buy_stop": 45.0},
     "filter": "industry"},
    {"symbol": "HHH", "setup": {"date": "2024-05-23", "atr": 1.5, "buy_stop": 50.0}},
    {"symbol": "NNN"},
    {"symbol": "OOO", "setup": {"date": "2024-05-24", "atr": 1.0, "buy_stop": 40.0}}
  ]
}
EOF
}

# VARIANT baseline: before slice 4, label and instrument reasons only;
# narrowed and amended-corrected: slice 4 as returned; corrected: the story's
# full exclusion list.
delivery_evidence_drift_write_product() {
  local workspace=$1 variant=$2 dimensions
  dimensions='"sector", "industry", "excluded_instrument", "outside_area", "relative_strength_gate"'
  [[ ${variant} != baseline ]] || dimensions='"sector", "industry", "excluded_instrument"'
  {
    cat << 'EOF'
"""Assemble the entry decision from the supplied scan outcomes."""
import json
import sys
from pathlib import Path

EOF
    printf 'EXCLUSION_DIMENSIONS = (%s)\n' "${dimensions}"
    cat << 'EOF'
HISTORY_REASONS = {"holdings": "already_held", "entry_orders": "already_ordered"}


def rank_key(row):
    newer_first = tuple(-int(part) for part in row["setup_date"].split("-"))
    return (row["ratio"], newer_first, row["symbol"])


def build_decision(inputs):
    blocked = {symbol: reason for key, reason in HISTORY_REASONS.items()
               for symbol in inputs[key]}
    ranked, excluded, history = [], [], []
    for candidate in inputs["candidates"]:
        symbol, setup = candidate["symbol"], candidate.get("setup")
        if setup is None:
            continue
        if candidate.get("filter"):
            if candidate["filter"] in EXCLUSION_DIMENSIONS:
                excluded.append({"symbol": symbol, "dimension": candidate["filter"]})
            continue
        if symbol in blocked:
            history.append({"symbol": symbol, "reason": blocked[symbol]})
EOF
    if [[ ${variant} == corrected ]]; then
      printf '            excluded.append({"symbol": symbol, "dimension": blocked[symbol]})\n'
    fi
    cat << 'EOF'
            continue
        ranked.append({
            "symbol": symbol, "setup_date": setup["date"], "atr": setup["atr"],
            "buy_stop": setup["buy_stop"], "ratio": round(setup["atr"] / setup["buy_stop"], 6),
        })
    ranked.sort(key=rank_key)
    for position, row in enumerate(ranked, start=1):
        row["rank"] = position
    excluded.sort(key=lambda row: (row["symbol"], row["dimension"]))
    return {"market_session": inputs["market_session"], "rank_source": "low-risk baseline",
            "ranked": ranked, "excluded_candidates": excluded, "history": history}


if __name__ == "__main__":
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("inputs.json")
    print(json.dumps(build_decision(json.loads(source.read_text())), indent=2))
EOF
  } > "${workspace}/entry/decision.py"
}

delivery_evidence_drift_write_tests() {
  local workspace=$1 variant=$2
  mkdir -p -- "${workspace}/tests"
  cat > "${workspace}/tests/test_decision.py" << 'EOF'
import json
import subprocess
import unittest


def decision():
    return json.loads(subprocess.check_output(["python3", "entry/decision.py"], text=True))


def excluded(*rows):
    return [{"symbol": symbol, "dimension": dimension} for symbol, dimension in rows]


class DecisionTest(unittest.TestCase):
    def test_rank_follows_the_low_risk_baseline(self):
        ranked = decision()["ranked"]
        self.assertEqual([(row["rank"], row["symbol"]) for row in ranked], [(1, "BBB"), (2, "AAA")])
        self.assertEqual([row["ratio"] for row in ranked], [0.02, 0.03])

    def test_filtered_setups_appear_with_their_reason(self):
        result = decision()
        self.assertIn({"symbol": "CCC", "dimension": "relative_strength_gate"}, result["excluded_candidates"])
        self.assertIn({"symbol": "DDD", "dimension": "outside_area"}, result["excluded_candidates"])
        self.assertNotIn("CCC", [row["symbol"] for row in result["ranked"]])
        self.assertNotIn("DDD", [row["symbol"] for row in result["ranked"]])

    def test_excluded_list_keeps_existing_reasons_in_order(self):
        self.assertEqual(decision()["excluded_candidates"], EXPECTED_EXCLUDED)

    def test_candidates_without_a_setup_are_not_listed(self):
        result = decision()
        listed = [row["symbol"] for key in ("ranked", "excluded_candidates", "history") for row in result[key]]
        self.assertNotIn("NNN", listed)

    def test_history_keeps_its_reasons(self):
        self.assertEqual(decision()["history"], [
            {"symbol": "HHH", "reason": "already_held"},
            {"symbol": "OOO", "reason": "already_ordered"},
        ])


EOF
  if [[ ${variant} == corrected ]]; then
    cat >> "${workspace}/tests/test_decision.py" << 'EOF'
EXPECTED_EXCLUDED = excluded(
    ("CCC", "relative_strength_gate"), ("DDD", "outside_area"), ("EEE", "sector"),
    ("FFF", "excluded_instrument"), ("GGG", "industry"), ("HHH", "already_held"),
    ("OOO", "already_ordered"))
EOF
  else
    cat >> "${workspace}/tests/test_decision.py" << 'EOF'
EXPECTED_EXCLUDED = excluded(
    ("CCC", "relative_strength_gate"), ("DDD", "outside_area"), ("EEE", "sector"),
    ("FFF", "excluded_instrument"), ("GGG", "industry"))
EOF
  fi
}

# Controls: corrected returns the story's full list; amended-corrected keeps
# the returned product under an explicit synthetic human amendment.
delivery_evidence_drift_write_control_context() {
  local workspace=$1 scenario=$2
  [[ ${scenario} == corrected || ${scenario} == amended-corrected ]] || return 0
  python3 - "${workspace}" "${scenario}" "${delivery_evidence_drift_story}" \
    "${delivery_evidence_drift_plan}" \
    "${source_dir}/tests/fixtures/delivery-evidence/drift-human-amendment.md" << 'PY'
from pathlib import Path
import sys
root, scenario, story, plan, amendment = Path(sys.argv[1]), *sys.argv[2:]
plan = root / plan
decision = ("- The excluded list carries filter outcomes; held and ordered symbols stay in\n"
            "  history with their existing reasons.\n")
text = plan.read_text()
assert decision in text
returned = root / ".planning/implementation-return.md"
if scenario == "corrected":
    text = text.replace(decision,
        "- The excluded list carries filter outcomes and the story's already-held and\n"
        "  already-ordered reasons; those symbols also keep their history rows.\n")
    old = ("Held and ordered symbols are untouched: they keep their existing reasons in\n"
           "the decision's `history`.\n")
    new = ("Held and ordered symbols are listed as `already_held` and `already_ordered`,\n"
           "are not ranked, and keep their existing reasons in the decision's `history`.\n")
    assert old in returned.read_text()
    returned.write_text(returned.read_text().replace(old, new))
else:
    story = root / story
    story.write_text(story.read_text() + Path(amendment).read_text())
    text = text.replace(decision, decision.rstrip("\n")[:-1]
                        + " under the story's explicit human amendment.\n")
plan.write_text(text)
PY
}

delivery_evidence_drift_populate_fixture() {
  local workspace=$1 scenario=$2 fixture_dir product=${2}
  fixture_dir="${source_dir}/tests/fixtures/delivery-evidence"
  [[ ${scenario} != amended-corrected ]] || product=narrowed
  mkdir -p -- "${workspace}/.planning/seeds" \
    "$(dirname -- "${workspace}/${delivery_evidence_drift_plan}")"
  cp -- "${fixture_dir}/drift-original-story.md" "${workspace}/${delivery_evidence_drift_story}"
  cp -- "${fixture_dir}/drift-narrowed-plan.md" "${workspace}/${delivery_evidence_drift_plan}"
  cp -- "${fixture_dir}/drift-implementation-return.md" \
    "${workspace}/.planning/implementation-return.md"
  delivery_evidence_drift_write_control_context "${workspace}" "${scenario}"
  delivery_evidence_drift_write_inputs "${workspace}"
  delivery_evidence_drift_write_product "${workspace}" baseline
  delivery_evidence_git "${workspace}" add entry .planning
  delivery_evidence_git "${workspace}" commit --quiet -m 'entry decision inputs and selected work'
  delivery_evidence_drift_write_product "${workspace}" "${product}"
  delivery_evidence_drift_write_tests "${workspace}" "${product}"
  (
    cd -- "${workspace}" || exit
    python3 -m unittest discover -s tests -p 'test_*.py'
  ) > "${workspace}/.planning/producer-proof.md" 2>&1
  mkdir -p -- "${delivery_evidence_root}/original-inputs"
  cp -R -- "${workspace}/.planning" "${workspace}/entry" "${workspace}/tests" \
    "${delivery_evidence_root}/original-inputs/"
}

#!/usr/bin/env bash
# ODF-139 controlled terminal-record replay, not a research rerun. Full selected
# source: pygardon cdc136edf; narrowed plan: cffbd3264; summary values and six
# labels: fe322751e replacement.json. Its check_replacement.py compared prose
# label rows to record.labels; it did not derive requirements from the source.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_terminal_write_labels() {
  local variant=$1
  cat << 'EOF'
LABELS = {
    "scope": "Modeled counterfactual at the pinned evaluator, not observed trading.",
    "classifications": "Current classifications of the frozen candidate.",
    "gate": "Not a gate test: point differences only.",
    "verdict": "The gate verdict and the four failed lower bounds stand.",
    "successor": "No successor exposure is retained after a sale.",
    "capacity_path_c": "Resolved within this scope.",
}
EOF
  if [[ ${variant} == corrected ]]; then
    cat << 'EOF'
LABELS["classifications"] = "Current, not point-in-time, Sharadar classifications."
LABELS["live_readiness"] = "No live-readiness conclusion."
EOF
  elif [[ ${variant} == baseline ]]; then
    printf 'LABELS.pop("capacity_path_c")\n'
  fi
}

delivery_evidence_terminal_write_product() {
  local workspace=$1 variant=$2
  mkdir -p -- "${workspace}/research"
  cat > "${workspace}/research/replacement.py" << 'EOF'
"""Publish the retained counterfactual summaries; no engine calculation."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
EOF
  delivery_evidence_terminal_write_labels "${variant}" >> "${workspace}/research/replacement.py"
  cat >> "${workspace}/research/replacement.py" << 'EOF'

record = json.loads((HERE / "precomputed.json").read_text())
record["labels"] = LABELS
print(json.dumps(record, indent=2))
EOF
}

delivery_evidence_terminal_write_tests() {
  local workspace=$1 variant=$2
  {
    printf 'from pathlib import Path\nimport sys\n'
    delivery_evidence_terminal_write_labels "${variant}"
    cat << 'EOF'
Path(sys.argv[1], "research/replacement.md").write_text(
    "# Replacement summary\n\n## Labels\n\n| Label | Value |\n| --- | --- |\n"
    + "".join(f"| {key} | {value} |\n" for key, value in LABELS.items())
)
EOF
  } | python3 - "${workspace}"
  cat > "${workspace}/research/check_replacement.py" << 'EOF'
"""Check producer publication against the selected plan and retained input."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
record = json.loads((HERE / "replacement.json").read_text())
prose = (HERE / "replacement.md").read_text().splitlines()
labels = [[cell.strip() for cell in row.strip("|").split("|")]
          for row in prose if row.startswith("| ")][2:]
assert labels == [[k, v] for k, v in record["labels"].items()], "labels"
precomputed = json.loads((HERE / "precomputed.json").read_text())
assert {k: v for k, v in record.items() if k != "labels"} == precomputed
assert {r["arm"] for r in record["counts"]} == {"reference", "ablation"}
assert {r["arm"] for r in record["window_2026"]} == {"reference", "ablation"}
assert {(r["arm"], r["bps"]) for r in record["effects"]} == {
    (arm, bps) for arm in ("reference", "ablation") for bps in (0, 5, 10, 20, 40)
}
print(f"PASS: {len(labels)} labels; both arms and all precomputed fields unchanged")
EOF
}

delivery_evidence_terminal_populate_fixture() {
  local workspace=$1 scenario=$2 fixture_dir
  fixture_dir="${source_dir}/tests/fixtures/delivery-evidence"
  mkdir -p -- "${workspace}/research" "${workspace}/.planning/seeds" \
    "${workspace}/.planning/slice-plans/340-terminal-capacity-reconciliation"
  cp -- "${fixture_dir}/terminal-precomputed.json" "${workspace}/research/precomputed.json"
  cp -- "${fixture_dir}/terminal-original-story.md" \
    "${workspace}/.planning/seeds/SEED-106-sharadar-search-confidence.md"
  cp -- "${fixture_dir}/terminal-narrowed-plan.md" \
    "${workspace}/.planning/slice-plans/340-terminal-capacity-reconciliation/PLAN.md"
  cp -- "${fixture_dir}/terminal-implementation-return.md" \
    "${workspace}/.planning/implementation-return.md"
  delivery_evidence_terminal_write_product "${workspace}" baseline
  delivery_evidence_terminal_write_tests "${workspace}" "${scenario}"
  delivery_evidence_git "${workspace}" add research .planning
  delivery_evidence_git "${workspace}" commit --quiet -m 'retained terminal summary and selected work'
  delivery_evidence_terminal_write_product "${workspace}" "${scenario}"
  (
    cd -- "${workspace}" || exit
    python3 research/replacement.py > research/replacement.json
    python3 research/check_replacement.py
  ) > "${workspace}/.planning/producer-proof.md" 2>&1
  mkdir -p -- "${delivery_evidence_root}/original-inputs"
  cp -R -- "${workspace}/.planning" "${workspace}/research" \
    "${delivery_evidence_root}/original-inputs/"
}

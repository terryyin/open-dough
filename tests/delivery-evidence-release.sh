#!/usr/bin/env bash
# The narrowed status projection passes its subset tests while failing each
# original status commitment; corrected projection exposes independent facts.
# shellcheck disable=SC1091,SC2034,SC2154
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/support/native-assessor-counterexample.sh"
source "${source_dir}/tests/support/delivery-evidence-native-run.sh"
root=$(mktemp -d)
trap 'rm -rf -- "${root}"' EXIT
delivery_evidence_create_fixture release "${source_dir}" codex narrowed "${root}" \
  > "${root}/fixture.txt" 2>&1
workspace=${delivery_evidence_workspace}
cmp "${source_dir}/tests/fixtures/delivery-evidence/release-original-story.md" \
  "${workspace}/.planning/seeds/SEED-120-release-readiness.md"
delivery_evidence_release_product_observation "${workspace}" > "${root}/narrowed.json"
python3 - "${root}/narrowed.json" << 'PY'
import json, sys
states = json.load(open(sys.argv[1]))
healthy = states["healthy"]["operation"]
assert healthy["phase"] == "running" and healthy["last_stage"] == "replace"
assert "stages" not in healthy
assert "capacity" not in healthy
ended = states["coordinator-ended"]["operation"]
assert ended["outcome"] is None and ended["error"] is None
assert "operations" not in ended
assert states["healthy"]["container"]["status"] == "running"
assert states["complete"]["api"] == {"status": 200}
PY
delivery_evidence_release_write_product "${workspace}" corrected
delivery_evidence_release_write_tests "${workspace}" corrected
(
  cd -- "${workspace}"
  python3 -m unittest discover -s tests -p 'test_*.py'
) > "${root}/corrected.txt" 2>&1
delivery_evidence_release_product_observation "${workspace}" > "${root}/corrected.json"
python3 - "${workspace}" "${root}/narrowed.json" "${root}/corrected.json" << 'PY'
import json, sys
from datetime import datetime
from pathlib import Path
root = Path(sys.argv[1])
narrowed, corrected = [json.load(open(path)) for path in sys.argv[2:]]
assert corrected["healthy"]["operation"]["phase"] == "readiness"
for name, result in corrected.items():
    facts = json.loads((root / f"records/{name}.json").read_text())
    operation, record = result["operation"], facts["record"]
    assert operation["stages"] == record["stages"]
    for stage in operation["stages"]:
        assert datetime.fromisoformat(stage["completed"].replace("Z", "+00:00"))
    assert operation["capacity"] == record["capacity"][-1]
    assert operation["capacity"]["free_bytes"] == 4096
    assert operation["capacity"]["required_bytes"] == 2048
    assert operation["operations"] == record["operations"]
    for key in ("image", "image_id", "revision", "version", "container", "api"):
        assert result[key] == narrowed[name][key]
ended = corrected["coordinator-ended"]["operation"]
assert ended["outcome"] is None  # no inference of parent success or liveness
assert ended["operations"][0]["outcome"] == "failed at readiness"
assert "candidate exited with code 1" in ended["operations"][0]["error"]
PY
run_delivery_evidence_original_assessor_counterexamples

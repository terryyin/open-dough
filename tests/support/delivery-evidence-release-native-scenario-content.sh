#!/usr/bin/env bash
# ODF-139 status-projection replay. Record shapes and _operation come from
# pygardon 403d1fb1b; the independent current-stage fact uses correction 361's
# later record contract. No historical Docker journey or writer is rerun.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_release_write_records() {
  python3 - "$1" << 'PY'
import copy
import json
from pathlib import Path
import sys

root = Path(sys.argv[1], "records")
root.mkdir()
started = "2026-10-15T01:00:00.000000Z"
replaced = "2026-10-15T01:00:10.000000Z"
finished = "2026-10-15T01:06:05.000000Z"
record = {
    "operation": "automatic deployment", "started": started,
    "finished": None, "outcome": None, "error": None,
    "image": "pygardon:0.1.0", "image_id": "sha256:fixture",
    "revision": "fixture-revision", "version": "0.1.0",
    "stages": [{"operation": "deployment", "name": "replace",
                "completed": replaced, "elapsed_seconds": 10.0,
                "details": ["candidate"]}],
    "capacity": [
        {"operation": "release image", "stage": "build", "measured": started,
         "free_bytes": 8192, "required_bytes": 1024},
        {"operation": "release image", "stage": "smoke", "measured": replaced,
         "free_bytes": 4096, "required_bytes": 2048},
    ],
    "operations": [{"operation": "deployment", "started": replaced,
                    "stage": "readiness", "finished": None,
                    "outcome": None, "error": None}],
}
healthy = {
    "record": record,
    "container": {"id": "candidate", "status": "running", "exit_code": 0,
                  "oom_killed": False, "restarts": 0, "started_at": replaced},
    "api_status": None,
}
ended = copy.deepcopy(healthy)
ended["record"]["operations"][0].update(
    stage=None, finished=finished, outcome="failed at readiness",
    error="candidate exited with code 1: missing provisioning input")
ended["container"].update(status="exited", exit_code=1)
complete = copy.deepcopy(healthy)
complete["record"].update(finished=finished, outcome="ready")
complete["record"]["operations"][0].update(
    stage=None, finished=finished, outcome="ready")
complete["record"]["stages"].append({
    "operation": "deployment", "name": "readiness", "completed": finished,
    "elapsed_seconds": 365.0, "details": []})
complete["api_status"] = 200
for name, facts in [("healthy", healthy), ("coordinator-ended", ended),
                    ("complete", complete)]:
    (root / f"{name}.json").write_text(json.dumps(facts, indent=2) + "\n")
PY
}

delivery_evidence_release_write_product() {
  local workspace=$1 variant=$2 projection=release-status-projection.py
  [[ ${variant} != corrected ]] || projection=release-corrected-status-projection.py
  cp -- "${source_dir}/tests/fixtures/delivery-evidence/${projection}" \
    "${workspace}/deployment/status.py"
  cat >> "${workspace}/deployment/status.py" << 'PY'


if __name__ == "__main__":
    import json
    from pathlib import Path
    import sys

    facts = json.loads(Path(sys.argv[1]).read_text())
    record = facts["record"]
    print(json.dumps({
        **{key: record[key] for key in ("image", "image_id", "revision", "version")},
        "container": facts["container"], "operation": _operation(record),
        "api": {"status": facts["api_status"]},
    }))
PY
  if [[ ${variant} == baseline ]]; then
    python3 - "${workspace}/deployment/status.py" << 'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
code = path.read_text()
start = code.index('        "elapsed_seconds": round(')
end = code.index('        "outcome":', start)
path.write_text(code[:start] + code[end:])
PY
  fi
}

delivery_evidence_release_write_tests() {
  local workspace=$1 variant=$2
  cat > "${workspace}/tests/test_status.py" << 'PY'
import json
from pathlib import Path
import subprocess
import unittest


def status(name):
    return json.loads(subprocess.check_output([
        "python3", "deployment/status.py", f"records/{name}.json"], text=True))


class StatusTest(unittest.TestCase):
    def test_healthy_summary(self):
        result = status("healthy")
        self.assertEqual(result["image_id"], "sha256:fixture")
        self.assertEqual(result["container"]["status"], "running")
        self.assertEqual(result["operation"]["phase"], "running")
        self.assertEqual(result["operation"]["last_stage"], "replace")
        self.assertGreaterEqual(result["operation"]["elapsed_seconds"], 0)

    def test_complete_summary(self):
        result = status("complete")
        self.assertEqual(result["operation"]["phase"], "finished")
        self.assertEqual(result["operation"]["outcome"], "ready")
        self.assertEqual(result["operation"]["elapsed_seconds"], 365.0)
        self.assertIsNotNone(result["operation"]["finished"])
        self.assertEqual(result["api"]["status"], 200)

    def test_status_has_no_application_body(self):
        for name in ("healthy", "coordinator-ended", "complete"):
            self.assertEqual(set(status(name)["api"]), {"status"})
PY
  if [[ ${variant} == corrected ]]; then
    python3 - "${workspace}/tests/test_status.py" << 'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
code = path.read_text().replace('["phase"], "running"', '["phase"], "readiness"')
path.write_text(code)
PY
    cat >> "${workspace}/tests/test_status.py" << 'PY'

    def test_record_facts_remain_visible(self):
        for name in ("healthy", "coordinator-ended", "complete"):
            record = json.loads(Path(f"records/{name}.json").read_text())["record"]
            operation = status(name)["operation"]
            self.assertEqual(operation["stages"], record["stages"])
            self.assertEqual(operation["capacity"], record["capacity"][-1])
            self.assertEqual(operation["operations"], record["operations"])

    def test_helper_failure_after_coordinator_ends(self):
        operation = status("coordinator-ended")["operation"]
        self.assertIsNone(operation["outcome"])
        helper = operation["operations"][0]
        self.assertEqual(helper["outcome"], "failed at readiness")
        self.assertIn("candidate exited with code 1", helper["error"])
        self.assertIsNotNone(helper["finished"])
PY
  fi
}

delivery_evidence_release_populate_fixture() {
  local workspace=$1 scenario=$2 fixture_dir
  fixture_dir="${source_dir}/tests/fixtures/delivery-evidence"
  mkdir -p -- "${workspace}/deployment" "${workspace}/tests" \
    "${workspace}/.planning/seeds" \
    "${workspace}/.planning/slice-plans/360-release-progress-and-terminal-failures"
  cp -- "${fixture_dir}/release-original-story.md" \
    "${workspace}/.planning/seeds/SEED-120-release-readiness.md"
  cp -- "${fixture_dir}/release-narrowed-plan.md" \
    "${workspace}/.planning/slice-plans/360-release-progress-and-terminal-failures/PLAN.md"
  cp -- "${fixture_dir}/release-implementation-return.md" \
    "${workspace}/.planning/implementation-return.md"
  delivery_evidence_release_write_records "${workspace}"
  delivery_evidence_release_write_product "${workspace}" baseline
  delivery_evidence_release_write_tests "${workspace}" "${scenario}"
  delivery_evidence_git "${workspace}" add deployment records tests .planning
  delivery_evidence_git "${workspace}" commit --quiet -m 'retained operation facts and selected work'
  delivery_evidence_release_write_product "${workspace}" "${scenario}"
  (
    cd -- "${workspace}" || exit
    python3 -m unittest discover -s tests -p 'test_*.py'
  ) > "${workspace}/.planning/producer-proof.md" 2>&1
  mkdir -p -- "${delivery_evidence_root}/original-inputs"
  cp -R -- "${workspace}/.planning" "${workspace}/deployment" \
    "${workspace}/records" "${workspace}/tests" "${delivery_evidence_root}/original-inputs/"
}

#!/usr/bin/env bash
# Purpose: frozen baseline evidence remains replayable after raw cleanup;
# complete failures survive, while interrupted or unsupported proof does not.
# The only external substitute is Codex; Git/install/retention/assessment run.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Fixture globals; expected-failure wrappers forward one checked command.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
source "${source_dir}/Distribution/tests/support/native-observation.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"
quiet=$(native_comparison_fixture_rule "${work}" quiet)
shortcut=$(native_comparison_fixture_rule "${work}" shortcut)
entry() { PATH="${work}/bin:${PATH}" CODEX_HOME="${work}/codex-home" "${native_comparison_fixture_entry[@]}" "$@"; }
capture() {
  entry --native codex --case paused-supplier --baseline "$1" --payload-repo "${work}/payloads" \
    --model gpt-test --effort low --deadline 120 --results-dir "${work}/results" \
    --save-baseline "$2"
}

# The working payload currently says shortcut, but the pinned quiet payload
# actually installed makes each hold use only its fetch, then passes proof.
baseline_archive="${work}/source/Distribution/tests/native-comparison/paused-supplier/comparisons/baseline.json"
capture "${quiet}" "${baseline_archive}" > "${work}/capture.out"
ln -s -- "${baseline_archive}" "${work}/baseline.json"
attempt=$(sed -n 's/^result-path: //p' "${work}/capture.out")
jq -e --arg rev "${quiet}" '.payload.revision == $rev and .observations["turn-1-commands"] == "1" and .exportAssessment.status == "pass" and .usage.status == "unknown" and .usage.totals == null and (.evidence.turns[-1].proof | length > 0)' "${work}/baseline.json" > /dev/null

# Unknown fields/raw account metadata and arbitrary model output stay local.
printf 'account-id: private-account-marker@example.invalid\n' >> "${attempt}/record"
printf '{"type":"account_metadata","account":"private-account-marker@example.invalid"}\n' >> "${attempt}/codex-session.jsonl"
entry --export-baseline "${attempt}" --save-baseline "${work}/export.json" > /dev/null
if grep -q 'private-account-marker\|/Users/\|/codex-home/' "${work}/export.json"; then
  echo 'FAIL: account-bearing raw evidence escaped export' >&2
  exit 1
fi

# Existing retained copies suffice even after original native home disappears.
rm -rf -- "${work}/codex-home"
entry --export-baseline "${attempt}" --save-baseline "${work}/copied.json" > /dev/null
before=$(shasum -a 256 "${work}/baseline.json")
if capture "${quiet}" "${work}/baseline.json" > "${work}/overwrite.out" 2> "${work}/overwrite.err"; then
  echo 'FAIL: an immutable baseline was overwritten' >&2
  exit 1
fi
[[ ${before} == "$(shasum -a 256 "${work}/baseline.json")" ]]
grep -q 'refusing to overwrite' "${work}/overwrite.err"

# A completed observed failure is still durable evidence, with the same
# assessor distinguishing the changed remote and missing agent proof.
status=0
capture "${shortcut}" "${work}/failed.json" > "${work}/failed.out" || status=$?
[[ ${status} -eq 1 ]]
jq -e '.capture.complete and .exportAssessment.status == "fail" and .observations["turn-4-remote"] == "changed"' "${work}/failed.json" > /dev/null
entry --assess-baseline "${work}/failed.json" > "${work}/failed-assessment.json"
jq -e '.status == "fail"' "${work}/failed-assessment.json" > /dev/null

# A claimed pass without the executed coordinator or owned-worker proof is
# insufficient; its old assessment string cannot supply that missing support.
node --input-type=module - "${attempt}/events-turn-4.jsonl" << 'NODE'
import { readFileSync, writeFileSync } from "node:fs";
const file = process.argv[2];
const rows = readFileSync(file, "utf8").trim().split("\n").map(JSON.parse);
writeFileSync(file, rows.filter((row) => row.item?.id !== "proof").map(JSON.stringify).join("\n") + "\n");
NODE
if entry --export-baseline "${attempt}" --save-baseline "${work}/unsupported.json" > /dev/null 2> "${work}/unsupported.err"; then
  echo 'FAIL: a previous pass supplied missing owned proof' >&2
  exit 1
fi
grep -q 'lacks decisive owned proof' "${work}/unsupported.err"
[[ ! -e ${work}/unsupported.json ]]

# Literal native wire under proof: a worker owns the current root turn and
# executes the proof in this workspace. Copied parent history is not new usage.
node --input-type=module - "${attempt}" << 'NODE'
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const attempt = process.argv[2], file = join(attempt, "codex-session.jsonl");
const parent = readFileSync(file, "utf8").trim().split("\n").map(JSON.parse);
const thread = parent.find((row) => row.type === "session_meta").payload.id;
const cwd = parent.find((row) => row.type === "turn_context").payload.cwd;
const row = (type, payload) => ({ type, payload, timestamp: "2026-11-14T00:00:00Z" });
const usage = (owner, turn, root, response) => row("token_usage_record", { thread_id: owner, turn_id: turn, root_turn_id: root, response_id: response, usage: { input_tokens: 10, cached_input_tokens: 7, output_tokens: 2, total_tokens: 12 } });
for (let n = 1; n <= 4; n++) parent.push(row("event_msg", { type: "task_started", turn_id: `root-${n}` }), usage(thread, `root-${n}`, `root-${n}`, `response-${n}`), row("event_msg", { type: "task_complete", turn_id: `root-${n}` }));
writeFileSync(file, parent.map(JSON.stringify).join("\n") + "\n");
const ownUsage = usage("worker", "worker-turn", "root-4", "worker-response");
const worker = [row("session_meta", { id: "worker", source: { subagent: { thread_spawn: { parent_thread_id: thread } } } }), row("event_msg", { type: "task_started", turn_id: "worker-turn" }), row("turn_context", { turn_id: "worker-turn", cwd }), row("response_item", { type: "function_call", name: "exec_command", call_id: "owned-proof", arguments: JSON.stringify({ cmd: "node --test tests/*.test.mjs", workdir: cwd }) }), row("response_item", { type: "function_call_output", call_id: "owned-proof", output: JSON.stringify({ exit_code: 0, output: "private-account-marker@example.invalid" }) }), ownUsage, ownUsage, usage(thread, "root-4", "root-4", "copied-parent-response"), row("event_msg", { type: "task_complete", turn_id: "worker-turn" })];
writeFileSync(join(attempt, "codex-worker-worker.jsonl"), worker.map(JSON.stringify).join("\n") + "\n");
NODE
printf 'codex-worker: worker parent=coordinator file=retained-copy\n' >> "${attempt}/record"
entry --export-baseline "${attempt}" --save-baseline "${work}/owned.json" > /dev/null
jq -e '.exportAssessment.status == "pass" and .usage.status == "complete" and .usage.totals.total_tokens == 60 and (.usage.responses | length == 5) and (.evidence.turns[-1].proof[-1] | .worker != null and .rootTurn != null and .exitCode == 0)' "${work}/owned.json" > /dev/null
if grep -q 'private-account-marker' "${work}/owned.json"; then
  echo 'FAIL: raw owned proof output escaped' >&2
  exit 1
fi
# A truncated independent receipt cannot be interpreted as exit zero.
cp -- "${attempt}/case-evidence/proof-4.exit" "${work}/proof.exit"
: > "${attempt}/case-evidence/proof-4.exit"
if entry --export-baseline "${attempt}" --save-baseline "${work}/truncated-proof.json" > /dev/null 2> "${work}/truncated-proof.err"; then
  echo 'FAIL: truncated independent proof became a pass' >&2
  exit 1
fi
grep -q 'malformed independent proof receipt' "${work}/truncated-proof.err"
cp -- "${work}/proof.exit" "${attempt}/case-evidence/proof-4.exit"

# Export also follows a pair's actual retained arm, preserving its frozen payload.
pair=$(native_comparison_fixture_record "${work}" "${quiet}" "${shortcut}" sequential pair)
entry --export-baseline "$(dirname -- "${pair}")" --save-baseline "${work}/pair-baseline.json" > /dev/null
jq -e --arg rev "${quiet}" '.payload.revision == $rev and .exportAssessment.status == "pass"' "${work}/pair-baseline.json" > /dev/null

# Malformed JSON and a truncated native stream cannot become reusable passes.
printf '{"schema":' > "${work}/truncated.json"
if entry --assess-baseline "${work}/truncated.json" > /dev/null 2>&1; then
  echo 'FAIL: malformed saved evidence was assessed' >&2
  exit 1
fi
interrupted=$(native_comparison_fixture_rule "${work}" quiet interrupted)
status=0
capture "${interrupted}" "${work}/interrupted.json" > "${work}/interrupted.out" 2> "${work}/interrupted.err" || status=$?
[[ ${status} -ne 0 && ! -e ${work}/interrupted.json ]]
grep -q 'stopped before its outcome was judged' "${work}/interrupted.err"

# Retained observation and derived correction stay byte-identical and useful
# after all raw sources disappear. Reassessment names its exact immutable source.
rm -rf -- "${work}/results" "${work}/codex-home"
entry --assess-baseline "${work}/baseline.json" > "${work}/current-assessment.json"
jq -e --slurpfile archive "${work}/baseline.json" '.status == "pass" and .sourceIntegrity == $archive[0].integrity and (.assessorHash | length == 64)' "${work}/current-assessment.json" > /dev/null
[[ ${before} == "$(shasum -a 256 "${work}/baseline.json")" ]]
entry --assess-baseline "${work}/owned.json" > "${work}/owned-assessment.json"
jq -e '.status == "pass"' "${work}/owned-assessment.json" > /dev/null

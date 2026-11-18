#!/usr/bin/env bash
# Purpose: one frozen capture of the quiet payload is the starting state for
# two behaviors: current evidence requirements and applied conditions own
# comparability (an archived pass cannot supply a missing fact or a match); a
# sufficient historical baseline launches only a new candidate, including a
# failed baseline, and remains distinct from a fresh pair.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Fixture globals; expected statuses are asserted.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/native-comparison-pair-fixture.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"
quiet=$(native_comparison_fixture_rule "${work}" quiet)
shortcut=$(native_comparison_fixture_rule "${work}" shortcut)
different_settings=$(native_comparison_fixture_rule "${work}" quiet settings)
native_comparison_fixture_capture "${work}" "${quiet}" baseline
original=$(shasum -a 256 "${work}/baseline.json")

# --- Conditions.
# Literal insufficient archive under proof: integrity is valid, but a decisive
# observation required by the current assessor is absent. A fresh arm provides it.
node --input-type=module - "${work}/baseline.json" "${work}/insufficient.json" << 'NODE'
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const archive = JSON.parse(readFileSync(process.argv[2], "utf8"));
delete archive.integrity;
delete archive.observations["turn-1-partial-work"];
archive.integrity = createHash("sha256").update(JSON.stringify(archive)).digest("hex");
writeFileSync(process.argv[3], JSON.stringify(archive));
NODE
insufficient=$(shasum -a 256 "${work}/insufficient.json")
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" concurrent insufficient --reuse-baseline "${work}/insufficient.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
grep -q 'saved evidence lacks current assessor input turn-1-partial-work' "${record}"
jq -e '.observations["turn-1-partial-work"] == "preserved" and .exportAssessment.status == "pass"' "$(dirname -- "${record}")/baseline.json" > /dev/null
[[ ${insufficient} == "$(shasum -a 256 "${work}/insufficient.json")" ]]

# Only the candidate launches for this pre-launch match. Its saved native
# settings then reveal a mismatch, so no outcome equivalence or delta is claimed.
before=$(native_comparison_fixture_sessions "${work}")
status=0
native_comparison_fixture_run "${work}" "${quiet}" "${different_settings}" sequential actual --reuse-baseline "${work}/baseline.json" || status=$?
[[ ${status} -eq 1 && $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'baseline-acquisition: reused' "${work}/actual.out"
grep -Fqx 'verdict: not-comparable' "${work}/actual.out"
grep -q '^candidate-settings: model=unexpected-applied-model' "${work}/actual.out"
grep -Fqx 'effort-difference: not computed: the pair is not-comparable' "${work}/actual.out"
[[ ${original} == "$(shasum -a 256 "${work}/baseline.json")" ]]

# --- Reuse.
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" sequential matched --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'baseline-acquisition: reused' "${record}"
grep -Fqx 'verdict: preserved' "${record}"
grep -Fqx "baseline-source: ${work}/baseline.json" "${record}"
grep -Eq '^baseline-observed-at: [0-9]{4}-' "${record}"
grep -q '^baseline-source-conditions: .*gpt-test' "${record}"
grep -q '^measurement-limit: reused baseline.*historical.*not a fresh concurrent pair' "${record}"
grep -q '^effort-baseline: 4 turns' "${record}"
[[ -s $(dirname -- "${record}")/baseline-assessment.json ]]

# Outcome/proof precedes effort even when only the cheaper bad candidate runs.
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${shortcut}" sequential regressed --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'verdict: regressed' "${record}"
grep -q '^effort-standing: not a gain:' "${record}"

# A complete observed task failure is sufficient to observe an improvement.
status=0
native_comparison_fixture_capture "${work}" "${shortcut}" failed || status=$?
[[ ${status} -eq 1 ]]
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${shortcut}" "${quiet}" sequential improved --reuse-baseline "${work}/failed.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'baseline-acquisition: reused' "${record}"
grep -Fqx 'verdict: improved' "${record}"

# Harmless retention changes and a current assessor change do not relabel
# capture provenance or launch another baseline. The new assessment is explicit.
printf '\n# Retention note only.\n' >> "${work}/source/Distribution/evaluation/src/native-guidance-check-retain.sh"
printf '\n# Current assessor review.\n' >> "${work}/source/Distribution/evaluation/cases/guidance-checks/paused-supplier/assess.bash"
native_comparison_fixture_git "${work}/source" add -A
native_comparison_fixture_git "${work}/source" commit -q -m 'Review retention and current assessment'
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" sequential reassessed --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'baseline-acquisition: reused' "${record}"
jq -e --slurpfile archive "${work}/baseline.json" '.sourceIntegrity == $archive[0].integrity and .assessorHash != $archive[0].exportAssessment.assessorHash' "$(dirname -- "${record}")/baseline-assessment.json" > /dev/null
[[ ${original} == "$(shasum -a 256 "${work}/baseline.json")" ]]

# Explicit fresh comparison runs both sessions and retains a new observation.
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" concurrent fresh --reuse-baseline "${work}/baseline.json" --fresh-pair)
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
grep -Fqx 'baseline-acquisition-reason: explicit fresh pair' "${record}"
[[ -s $(dirname -- "${record}")/baseline.json ]]
[[ ${original} == "$(shasum -a 256 "${work}/baseline.json")" ]]

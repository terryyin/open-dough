#!/usr/bin/env bash
# Purpose: current evidence requirements and actual applied conditions own
# comparability; an archived pass cannot supply a missing fact or a match.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Fixture globals; expected statuses are asserted.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"
quiet=$(native_comparison_fixture_rule "${work}" quiet)
different_settings=$(native_comparison_fixture_rule "${work}" quiet settings)
known_usage=$(native_comparison_fixture_rule "${work}" quiet usage)
native_comparison_fixture_capture "${work}" "${quiet}" baseline
original=$(shasum -a 256 "${work}/baseline.json")

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

# Complete own native response counters satisfy an explicit usage criterion.
# The CLI's cumulative usage does not double the four native responses.
native_comparison_fixture_capture "${work}" "${known_usage}" accounted
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${known_usage}" "${known_usage}" sequential accounted --reuse-baseline "${work}/accounted.json" --require-usage)
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'verdict: preserved' "${record}"
grep -Fqx 'condition-criteria: sufficient' "${record}"
grep -Fqx 'effort-native-usage-baseline: {"input_tokens":4,"cached_input_tokens":0,"output_tokens":4,"total_tokens":8}' "${record}"
grep -Fqx 'effort-native-usage-difference: candidate 0 processed tokens against baseline' "${record}"

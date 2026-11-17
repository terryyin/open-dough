#!/usr/bin/env bash
# Assertions over real fixture inputs as the substitute receives them.
# shellcheck disable=SC1091,SC2312
# shellcheck disable=SC2154 # The public-entry test supplies RETURN_TRANSPORT_*.
set -euo pipefail
workspace=$1 case_name=$2 scenario=$3 legacy_revision=$4
source_dir=${RETURN_TRANSPORT_SOURCE}
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh"
verdict="${workspace}/.planning/implementation-return.md"
evidence=$(git -C "${workspace}" rev-parse --path-format=absolute --git-path open-dough/evidence)
expect_pattern() {
  local fact=$1 file=$2 pattern=$3 matched=false
  if grep -Eq -- "${pattern}" "${file}"; then matched=true; fi
  native_check_expect_value "${fact}" true "${matched}" "${file}"
}
expect_no_pattern() {
  local fact=$1 file=$2 pattern=$3 matched=false
  if grep -Eq -- "${pattern}" "${file}"; then matched=true; fi
  native_check_expect_value "${fact}" false "${matched}" "${file}"
}
assert_command() {
  local record=$1 status=0
  shift
  node - "${record}" "$@" > "${RETURN_TRANSPORT_RESULT}.command" 2>&1 << 'JS' || status=$?
const fs = require('node:fs');
const assert = require('node:assert/strict');
assert.deepEqual(JSON.parse(fs.readFileSync(process.argv[2])).command, process.argv.slice(3));
JS
  native_check_expect_status 'record retains the actual producer argv' 0 "${status}" "${record}" "${RETURN_TRANSPORT_RESULT}.command"
}
if [[ -n ${legacy_revision} ]]; then
  expect_pattern 'legacy narrative keeps its proof block' "${verdict}" '^proof:'
  expect_no_pattern 'legacy narrative has no compact report link' "${verdict}" 'Full report:'
  native_check_expect_absent 'legacy payload has no return owner' "${workspace}/.claude/skills/dough-execute-plan/references/return-report.md"
  native_check_expect_absent 'legacy fixture has no Git evidence' "${evidence}"
  exit 0
fi
native_check_expect_line 'verdict reaches full original report' "${verdict}" "Full report: ${evidence}/implementation-report.md"
expected_rows=1
case ${case_name} in
  selection) [[ ${scenario} == zero-test ]] || expected_rows=3 ;;
  original) expected_rows=3 ;;
  gaps | deferred | terminal | release | drift) expected_rows=2 ;;
  *) ;;
esac
native_check_expect_value 'verdict includes every promise row' "${expected_rows}" "$(grep -Ec '^[0-9]+[.] |^Slice [0-9]+:' "${verdict}")" "${verdict}"
native_check_expect_line 'verdict states stop disposition' "${verdict}" 'Stops: none reported'
mapfile -t records < <(sed -n 's/^- \(.*[.]run[.]json\)$/\1/p' "${verdict}")
native_check_expect_value 'verdict references actual run records' true "$([[ ${#records[@]} -gt 0 ]] && printf true || printf false)" "${verdict}"
for record in "${records[@]}"; do
  status=0
  node "${source_dir}/Distribution/evaluation/tests/delivery-evidence/support/delivery-evidence-run-record-observations.mjs" \
    "${record}" "${workspace}" > "${RETURN_TRANSPORT_RESULT}.record" 2>&1 || status=$?
  native_check_expect_status 'record reaches authentic terminal proof and matching source revision' 0 "${status}" "${record}" "${RETURN_TRANSPORT_RESULT}.record"
done
native_check_expect_value 'installed guidance is outside the original baseline tree' '' "$(git -C "${workspace}" ls-tree -r --name-only HEAD .agents .claude)"
case ${case_name} in
  selection)
    test_file=tests/overview.test.mjs pattern='published overview'
    [[ ${scenario} != zero-test ]] || {
      test_file=tests/merge.test.mjs
      pattern='merge direction'
    }
    assert_command "${evidence}/producer-proof.log.run.json" bash bin/run-proof.sh "--test-name-pattern=${pattern}" "${test_file}"
    case ${scenario} in zero-test) selected=0 ;; partial-selection) selected=1 ;; complete-selection) selected=3 ;; *) ;; esac
    native_check_expect_line 'selection keeps the original zero, partial or sufficient subject' "${workspace}/.planning/selection.log" "selected=${selected} "
    if [[ ${scenario} == zero-test ]]; then
      expect_pattern 'merge promise is present' "${verdict}" '^1[.] Merge direction keeps the decided order'
    else
      expect_pattern 'published overview promise is present' "${verdict}" '^1[.] Published overview renders the summary'
      expect_pattern 'empty groups promise is present' "${verdict}" '^2[.] Empty groups stay empty'
      expect_pattern 'initial read failure promise is present' "${verdict}" '^3[.] Initial read failure surfaces'
    fi
    native_check_expect_line 'original report keeps its passing claim' "${evidence}/implementation-report.md" 'result: pass'
    ;;
  claims)
    expect_pattern 'bare-anchor promise is present' "${verdict}" '^1[.] Bare anchors are not followable and name no repository path'
    assert_command "${evidence}/producer-proof.log.run.json" node --test tests/source-link.test.mjs
    expect_pattern 'original bare-anchor report survives' "${evidence}/implementation-report.md" '[Bb]are.*anchor'
    if [[ ${scenario} == unsupported-claim ]]; then
      expect_no_pattern 'unsupported claim still lacks the asserted bare-anchor case' "${workspace}/tests/source-link.test.mjs" "test\('bare anchor"
    fi
    ;;
  consumers | deferred)
    if [[ ${case_name} == deferred ]]; then
      expect_pattern 'factory promise is present' "${verdict}" '^1[.] Factory and producers use release tags'
      expect_pattern 'independent badge promise is present' "${verdict}" '^2[.] Independent status badge remains unchanged'
      expect_pattern 'deferred E2E observation remains explicit' "${verdict}" 'Learning:.*left unrun for CI'
      assert_command "${evidence}/producer-proof.log.run.json" node --test --test-reporter=tap tests/producer.test.mjs
      assert_command "${evidence}/status-proof.log.run.json" node --test --test-reporter=tap tests/status-badge.test.mjs
    fi
    if [[ ${case_name} == consumers ]]; then
      if [[ ${scenario} == unchanged-boundary ]]; then
        expect_pattern 'unchanged badge promise is present' "${verdict}" '^1[.] Status badge labels remain text'
      else
        expect_pattern 'factory and consumer promise is present' "${verdict}" '^1[.] Factory release-tag contract and applicable consumers'
      fi
    fi
    if [[ ${scenario} == changed-contract || ${scenario} == known-caller ]]; then
      native_check_expect_line 'original incompatible caller remains' "${workspace}/e2e/support/e2eStandIn.mjs" 'return createCommand(context);'
    fi
    ;;
  gaps)
    expect_pattern 'readiness requeue promise is present' "${verdict}" '^1[.] Failed readiness requeues then starts on next observation'
    expect_pattern 'ready admission promise is present' "${verdict}" '^2[.] Ready release tag starts immediately'
    if [[ ${scenario} == sufficient-reused ]]; then
      assert_command "${evidence}/producer-proof.log.run.json" node --test tests/admission-happy.test.mjs tests/readiness-requeue.test.mjs
      native_check_expect_line 'sufficient proof still observes requeue' "${evidence}/producer-proof.log" 'failed readiness requeues then starts on next observation'
    else
      expect_pattern 'missing requeue proof remains explicit' "${verdict}" 'Learning:.*not covered by the returned test'
      native_check_expect_line 'original report keeps its requeue gap' "${evidence}/implementation-report.md" 'not covered by a test'
      expect_no_pattern 'actual producer did not select missing requeue proof' "${evidence}/producer-proof.log.run.json" 'readiness-requeue.test.mjs'
    fi
    ;;
  original)
    for subject in 'Current resolution' 'Legacy comparison' 'Goal and agreement edits'; do expect_pattern 'original promise is present' "${verdict}" "^Slice 3: ${subject}"; done
    assert_command "${evidence}/producer-proof.log.run.json" node --test tests/readiness.test.mjs
    native_check_expect_line 'original report keeps its planned-coverage claim' "${evidence}/implementation-report.md" 'All planned reader comparisons are covered'
    ;;
  terminal)
    expect_pattern 'terminal summary promise is present' "${verdict}" '^Slice 3: Both arms and all precomputed summary fields'
    expect_pattern 'terminal qualification promise is present' "${verdict}" '^Slice 3: Result qualifications'
    native_check_expect_line 'terminal limit remains explicit' "${verdict}" 'Consequential limits: expensive evaluator'
    native_check_expect_line 'original terminal limitation survives' "${evidence}/implementation-report.md" 'The expensive evaluator and admission-ledger calculation are existing inputs'
    ;;
  release)
    expect_pattern 'release summary promise is present' "${verdict}" '^Slice 3: Identity, container state and API code'
    expect_pattern 'operation phase promise is present' "${verdict}" '^Slice 3: Newest operation phase'
    native_check_expect_line 'release owner limit remains explicit' "${verdict}" 'status after the coordinator ends is reported as a future owner decision'
    native_check_expect_line 'original release limitation survives' "${evidence}/implementation-report.md" 'Status after the coordinator ends is an owner decision'
    ;;
  drift)
    expect_pattern 'filtered setup promise is present' "${verdict}" '^Slice 4: Filtered setups carry reasons'
    expect_pattern 'existing ordering promise is present' "${verdict}" '^Slice 4: Existing reasons, ordering, ranking and history'
    native_check_expect_line 'drift limit remains explicit' "${verdict}" 'Consequential limits: incomplete coverage and the risk-off empty state'
    native_check_expect_line 'original drift limitation survives' "${evidence}/implementation-report.md" 'Incomplete coverage and the risk-off empty state remain'
    ;;
  *) ;;
esac
if [[ ${scenario} == narrowed && ${case_name} != original ]]; then
  status=0
  node - "${source_dir}/Distribution/evaluation/cases/delivery-evidence/fixtures/${case_name}-implementation-return.md" "${evidence}/implementation-report.md" \
    > "${RETURN_TRANSPORT_RESULT}.report" 2>&1 << 'JS' || status=$?
const fs = require('node:fs');
const assert = require('node:assert/strict');
assert.ok(fs.readFileSync(process.argv[3], 'utf8').startsWith(fs.readFileSync(process.argv[2], 'utf8')));
JS
  native_check_expect_status 'full original report is preserved byte for byte' 0 "${status}" "${RETURN_TRANSPORT_RESULT}.report"
fi

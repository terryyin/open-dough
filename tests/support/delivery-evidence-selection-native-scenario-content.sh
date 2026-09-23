#!/usr/bin/env bash
# Scenario workspace content for delivery-evidence/selection: tests, promises,
# misleading return, proof-selection logger, and planted initial selection log.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_selection_write_tests() {
  local workspace=$1
  local scenario=$2
  mkdir -p -- "${workspace}/tests" "${workspace}/lib"
  cat > "${workspace}/lib/overview.mjs" << 'EOF'
import { readFileSync } from 'node:fs';

export function readOverview(path = 'product.txt') {
  const text = readFileSync(path, 'utf8');
  return {
    summary: text.includes('summary:ready'),
    emptyGroups: text.includes('empty-groups:ready'),
    initialReadFailure: text.includes('initial-read-failure:ready'),
  };
}

export function mergeDirection(path = 'product.txt') {
  const text = readFileSync(path, 'utf8');
  return text.includes('merge-direction:ready');
}
EOF
  case ${scenario} in
    zero-test)
      cat > "${workspace}/tests/merge.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeDirection } from '../lib/overview.mjs';

test('merge items keeps stable order', () => {
  assert.equal(mergeDirection() || true, true);
});

test('merge order ignores unrelated noise', () => {
  assert.ok(true);
});
EOF
      ;;
    partial-selection)
      cat > "${workspace}/tests/overview.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readOverview } from '../lib/overview.mjs';

test('published overview renders the summary', () => {
  assert.equal(readOverview().summary, true);
});

test('empty groups stay empty', () => {
  assert.equal(readOverview().emptyGroups, true);
});

test('initial read failure surfaces', () => {
  assert.equal(readOverview().initialReadFailure, true);
});
EOF
      ;;
    complete-selection)
      cat > "${workspace}/tests/overview.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { readOverview } from '../lib/overview.mjs';

test('published overview renders the summary', () => {
  assert.equal(readOverview().summary, true);
});

test('published overview empty groups stay empty', () => {
  assert.equal(readOverview().emptyGroups, true);
});

test('published overview initial read failure surfaces', () => {
  assert.equal(readOverview().initialReadFailure, true);
});
EOF
      ;;
    *) return 2 ;;
  esac
}

delivery_evidence_selection_write_promises_and_return() {
  local workspace=$1
  local scenario=$2
  mkdir -p -- "${workspace}/.planning"
  case ${scenario} in
    zero-test)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. Merge direction keeps the decided order for conflicting backlog items.
EOF
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Implemented merge direction for conflicting backlog items.

proof:
  command: bash bin/run-proof.sh --test-name-pattern='merge direction' tests/merge.test.mjs
  covers: merge direction keeps the decided order
  boundary: tests/merge.test.mjs
  observations:
    - tests/merge.test.mjs merge direction: order is preserved
  setup: none
  result: pass
EOF
      delivery_evidence_selection_claimed=1
      delivery_evidence_selection_initial=0
      ;;
    partial-selection)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. Published overview renders the summary.
2. Empty groups stay empty on the overview.
3. Initial read failure surfaces on the overview.
EOF
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Implemented the published overview behaviors.

proof:
  command: bash bin/run-proof.sh --test-name-pattern='published overview' tests/overview.test.mjs
  covers: overview summary, empty groups, and initial read failure
  boundary: tests/overview.test.mjs
  observations:
    - tests/overview.test.mjs published overview: summary, empty groups, initial read failure
  setup: none
  result: pass
EOF
      delivery_evidence_selection_claimed=3
      delivery_evidence_selection_initial=1
      ;;
    complete-selection)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. Published overview renders the summary.
2. Empty groups stay empty on the overview.
3. Initial read failure surfaces on the overview.
EOF
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Implemented the published overview behaviors.

proof:
  command: bash bin/run-proof.sh --test-name-pattern='published overview' tests/overview.test.mjs
  covers: overview summary, empty groups, and initial read failure
  boundary: tests/overview.test.mjs
  observations:
    - tests/overview.test.mjs published overview renders the summary
    - tests/overview.test.mjs published overview empty groups stay empty
    - tests/overview.test.mjs published overview initial read failure surfaces
  setup: none
  result: pass
EOF
      delivery_evidence_selection_claimed=3
      delivery_evidence_selection_initial=3
      ;;
    *) return 2 ;;
  esac
}

# Logs every filtered proof invocation's named-test selection count.
# Counts named Subtests, not Node's file-level phantom when a pattern matches
# nothing (Node can still exit 0 and report tests=1 for the file).
delivery_evidence_selection_install_test_logger() {
  local workspace=$1
  local logger="${workspace}/bin/run-proof.sh"
  mkdir -p -- "${workspace}/bin"
  cat > "${logger}" << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
log="${SELECTION_LOG:-.planning/selection.log}"
mkdir -p -- "$(dirname -- "${log}")"
pattern=
args=("$@")
i=0
while [[ ${i} -lt ${#args[@]} ]]; do
  case ${args[i]} in
    --test-name-pattern)
      i=$((i + 1))
      pattern=${args[i]}
      ;;
    --test-name-pattern=*)
      pattern=${args[i]#--test-name-pattern=}
      ;;
  esac
  i=$((i + 1))
done
tmp=$(mktemp)
set +e
node --test --test-reporter=tap "${args[@]}" > "${tmp}" 2>&1
status=$?
set -e
# Named tests appear as TAP "ok/not ok N - name". Exclude the file-suite
# phantom Node emits when a name pattern matches no tests (still exit 0).
# grep -Ev exits 1 when every line is filtered; do not let pipefail abort.
selected=$(
  { grep -E '^(ok|not ok) [0-9]+ - ' "${tmp}" \
      | grep -Ev ' - [^ ]+\.(mjs|js|cjs|ts)$| - [^ ]+/[^ ]+$' \
      || true; } \
    | wc -l \
    | tr -d ' '
)
selected=${selected:-0}
printf 'selected=%s pattern=%s exit=%s\n' "${selected}" "${pattern}" "${status}" \
  >> "${log}"
printf '# named-tests-selected: %s\n' "${selected}"
cat "${tmp}"
rm -f -- "${tmp}"
exit "${status}"
EOF
  chmod a+x "${logger}"
}

delivery_evidence_selection_plant_initial_selection() {
  local workspace=$1
  local scenario=$2
  local log="${workspace}/.planning/selection.log"
  case ${scenario} in
    zero-test)
      printf 'selected=0 pattern=merge direction exit=0\n' > "${log}"
      ;;
    partial-selection)
      printf 'selected=1 pattern=published overview exit=0\n' > "${log}"
      ;;
    complete-selection)
      printf 'selected=3 pattern=published overview exit=0\n' > "${log}"
      ;;
    *) return 2 ;;
  esac
}

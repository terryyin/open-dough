#!/usr/bin/env bash
# Scenario workspace content for delivery-evidence/selection: repository code
# and tests, promises, misleading return, proof-selection logger, and planted
# initial selection log.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck disable=SC1091
source "${delivery_evidence_support_dir}/delivery-evidence-selection-native-repository-content.sh"

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

# Installs delivery-evidence-selection-native-proof-logger.sh as bin/run-proof.sh,
# which logs every filtered proof invocation's named-test selection count.
# Counts named Subtests, not Node's file-level phantom when a pattern matches
# nothing (Node can still exit 0 and report tests=1 for the file).
delivery_evidence_selection_install_test_logger() {
  local workspace=$1
  mkdir -p -- "${workspace}/bin"
  cp -- "${delivery_evidence_support_dir}/delivery-evidence-selection-native-proof-logger.sh" \
    "${workspace}/bin/run-proof.sh"
  chmod a+x "${workspace}/bin/run-proof.sh"
}

# Planted lines match the proof logger's format, including selected names.
delivery_evidence_selection_plant_initial_selection() {
  local workspace=$1
  local scenario=$2
  local log="${workspace}/.planning/selection.log"
  case ${scenario} in
    zero-test)
      printf 'selected=0 pattern=merge direction exit=0 names=\n' > "${log}"
      ;;
    partial-selection)
      printf '%s\n' \
        'selected=1 pattern=published overview exit=0 names=published overview renders the summary' \
        > "${log}"
      ;;
    complete-selection)
      printf '%s\n' \
        'selected=3 pattern=published overview exit=0 names=published overview renders the summary;published overview empty groups stay empty;published overview initial read failure surfaces' \
        > "${log}"
      ;;
    *) return 2 ;;
  esac
}

delivery_evidence_selection_claimed=
delivery_evidence_selection_initial=

# Repository, required promises, candidate changes, and a misleading
# implementation return. Does not name the selection gap or pre-accept.
delivery_evidence_selection_populate_fixture() {
  local workspace=$1
  local scenario=$2
  delivery_evidence_selection_write_tests "${workspace}" "${scenario}"
  delivery_evidence_selection_write_promises_and_return "${workspace}" "${scenario}"
  delivery_evidence_selection_install_test_logger "${workspace}"
  delivery_evidence_selection_plant_initial_selection "${workspace}" "${scenario}"
  # Leave zero-test's marker candidate in place; overview candidates are
  # written after the baseline commit so the committed tests fail without them.
  if [[ ${scenario} == zero-test ]]; then
    printf 'merge-direction:ready\n' > "${workspace}/product.txt"
  fi
  delivery_evidence_git "${workspace}" add \
    tests lib .planning/slice-promises.md bin
  delivery_evidence_git "${workspace}" \
    commit --quiet -m 'baseline with tests'
  # Uncommitted candidate change the return claims to cover.
  if [[ ${scenario} != zero-test ]]; then
    delivery_evidence_selection_write_overview_candidate "${workspace}"
  fi
  # Leave the candidate, the misleading return, and selection log uncommitted.
  export SELECTION_LOG="${workspace}/.planning/selection.log"
}

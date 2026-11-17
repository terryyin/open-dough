#!/usr/bin/env bash
# Scenario workspace content for delivery-evidence/consumers: two-revision
# factory contract, stale unaffected-suite exclusion, producer proof, E2E
# stand-in, and an unrelated unchanged-boundary control. Does not name the
# missed consumer or pre-perform acceptance.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck disable=SC1091
source "${delivery_evidence_support_dir}/delivery-evidence-consumers-native-product-content.sh"

delivery_evidence_consumers_write_promises_and_return() {
  local workspace=$1
  local scenario=$2
  mkdir -p -- "${workspace}/.planning"
  case ${scenario} in
    changed-contract)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. `createCommand` requires `(context, releaseTag)` and producers build commands
   with a release tag.
EOF
      # Second revision: factory and producer updated; stand-in left incompatible.
      delivery_evidence_consumers_write_factory_two_arg "${workspace}"
      delivery_evidence_consumers_write_producer_tests_two_arg "${workspace}"
      # Intentionally leave one-arg stand-in and one-arg compat test.
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Changed CommandFactory to require `(context, releaseTag)`.

E2E suite is unaffected — previously assessed that the stand-in does not call
CommandFactory. Producer proof covers the factory signature change.

proof:
  command: node --test tests/producer.test.mjs
  covers: createCommand(context, releaseTag)
  boundary: lib/commandFactory.mjs
  observations:
    - tests/producer.test.mjs producer builds command with release tag
  setup: none
  result: pass
EOF
      ;;
    corrected-consumer)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. `createCommand` requires `(context, releaseTag)` and the E2E stand-in builds
   commands with the current factory contract.
EOF
      delivery_evidence_consumers_write_factory_two_arg "${workspace}"
      delivery_evidence_consumers_write_stand_in_two_arg "${workspace}"
      delivery_evidence_consumers_write_producer_tests_two_arg "${workspace}"
      delivery_evidence_consumers_write_compat_tests_two_arg "${workspace}"
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Aligned the E2E stand-in to `createCommand(context, releaseTag)` and obtained
compatibility proof.

proof:
  command: node --test tests/producer.test.mjs e2e/stand-in-compat.test.mjs
  covers: producer and E2E stand-in use the two-arg factory contract
  boundary: lib/commandFactory.mjs, e2e/support/e2eStandIn.mjs
  observations:
    - tests/producer.test.mjs producer builds command with release tag
    - e2e/stand-in-compat.test.mjs e2e stand-in builds command with current factory contract
  setup: none
  result: pass
EOF
      ;;
    unchanged-boundary)
      cat > "${workspace}/.planning/slice-promises.md" << 'EOF'
# Current slice promises

1. Status badge labels remain `badgeLabel(status)` text for the given status.
EOF
      # Factory/stand-in stay at the baseline one-arg contract (unchanged).
      # Unrelated badge boundary is already correct with its existing proof.
      cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
No change to status badge labeling. Existing proof still covers the promise.

proof:
  command: node --test tests/status-badge.test.mjs
  covers: badgeLabel returns the status text
  boundary: lib/statusBadge.mjs
  observations:
    - tests/status-badge.test.mjs badge labels status
  setup: none
  result: pass
EOF
      ;;
    *) return 2 ;;
  esac
}

# Committed baseline revision, then the uncommitted scenario overlay: the
# implementation return and any contract edits left for acceptance.
delivery_evidence_consumers_populate_fixture() {
  delivery_evidence_consumers_write_baseline_revision "$1"
  delivery_evidence_git "$1" add \
    lib e2e tests .planning/prior-consumer-assessment.md
  delivery_evidence_git "$1" \
    commit --quiet -m 'baseline one-arg factory with matching E2E stand-in'
  delivery_evidence_consumers_write_promises_and_return "$1" "$2"
}

# Explicit returned claims; acceptance still inspects the original report/proof.
delivery_evidence_consumers_return() {
  local -a command=(node --test tests/producer.test.mjs)
  case $2 in
    corrected-consumer) command+=(e2e/stand-in-compat.test.mjs) ;;
    unchanged-boundary) command=(node --test tests/status-badge.test.mjs) ;;
    *) ;;
  esac
  delivery_evidence_run_producer "$1" producer-proof "${command[@]}" > "$1/.planning/producer-proof.md" 2>&1
  if [[ $2 == unchanged-boundary ]]; then
    delivery_evidence_return_promise '1. Status badge labels remain text — claimed pass; observation: tests/status-badge.test.mjs badge labels status.'
  else
    delivery_evidence_return_promise '1. Factory release-tag contract and applicable consumers — claimed pass; observations: tests/producer.test.mjs and the full report; prior exclusion: .planning/prior-consumer-assessment.md.'
  fi
}

#!/usr/bin/env bash
# Purpose: the launch-command-tests assessor (case.md, Assessment) passes the
# observer fields of a protective refactoring and rejects, with its reason,
# the fields a mechanical update (perturbation red), a weakened default
# proof (default fault green), the unchanged starting state (owning proof
# failed), unrestored probes or missing fields leave. The records follow the
# fields the reference qualification observed through the entry.
# shellcheck disable=SC1091 # Sourced runner, helper and case.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-run.sh"
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-assessor-counterexample.sh"
case_path="${source_dir}/Distribution/evaluation/cases/guidance-checks/launch-command-tests"
source "${case_path}/assess.bash"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

cat > "${work}/protective" << 'FIELDS'
turn-1-status: completed
turn-1-source: changed
turn-1-backend: passed
turn-1-backend-tests: 28/0
turn-1-e2e: passed
turn-1-e2e-tests: 4/0
turn-1-perturbation-e2e: green
turn-1-perturbation-ad-hoc: green
turn-1-fault-name: red
turn-1-fault-instruction: red
turn-1-fault-default: red
turn-1-probes-restored: true
FIELDS
native_assessor_counterexamples "${case_path}/assess.bash" "${work}/protective" \
  --verdict case_assess_status case_assess_reason -- case_assess
native_assessor_rejects_field_rows << 'ROWS'
mechanical-literals perturbation turn-1-perturbation-e2e: red | unrelated default perturbation broke the launch tests (e2e red
coupled-ad-hoc-spec perturbation turn-1-perturbation-ad-hoc: red | unrelated default perturbation broke the launch tests
weakened-default-proof default-owner turn-1-fault-default: green | wrong default effort left its dedicated proof green
unowned-name name-owner turn-1-fault-name: green | wrong launch name left its owning spec green
unowned-absence instruction-owner turn-1-fault-instruction: green | prompt on a blank launch left its owning consumer green
unchanged-consumer owning-proof turn-1-e2e: failed | owning proof does not pass (backend passed, e2e failed)
failing-backend owning-proof turn-1-backend: failed | owning proof does not pass
unrestored-probes restoration turn-1-probes-restored: false | probes did not restore
unapplied-perturbation perturbation turn-1-perturbation-e2e: unapplied | unrelated default perturbation
unfinished-session session turn-1-status: timeout | did not complete (timeout)
ROWS
native_assessor_rejects_missing_fields << 'ROWS'
owning-proof turn-1-e2e
perturbation turn-1-perturbation-ad-hoc
default-owner turn-1-fault-default
restoration turn-1-probes-restored
ROWS

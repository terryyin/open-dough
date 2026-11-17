#!/usr/bin/env bash
# Assessor of the launch-command-tests case (case.md), outside the agent's
# workspace. The refactoring basis is not defined yet: until it is, every
# observation fails with that reason, so no run of this case qualifies.
# Leaves case_assess_status and case_assess_reason for the runner.
# shellcheck disable=SC2034 # case_assess_* are read by the runner.

case_assess() {
  case_assess_status=fail
  case_assess_reason='no refactoring assessment is defined yet'
}

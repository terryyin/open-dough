#!/usr/bin/env bash
# Fixture for tests/native-assessor-counterexample-guard.sh, never run: a suite
# that states rejected cases outside the helper, which the guard must name by
# line, beside shapes the guard must leave alone. Keep the flagged lines where
# that check expects them.
# shellcheck disable=SC2154,SC2312,SC2317 # Fixture text, never run.

stray_rejected_cases() {
  git_publication_suite_expect_rejected git_publication_assess obs.txt
  git_publication_assess obs.txt
  git_publication_suite_expect_assess fail 'missing remote acceptance'
  ! ci_completion_assess pending obs.txt
  if delivery_evidence_selection_assess obs.txt; then
    echo 'FAIL: accepted a repeated partial filter' >&2
    exit 1
  fi
  story_closure_assess obs.txt && echo 'FAIL: accepted' >&2 && return 1
  suite_expect inconclusive 'uncertain prose'
  if [[ ${native_journey_state_status} == 'pass' ]]; then
    echo 'FAIL: accepted stale target' >&2
    return 1
  fi
  [[ ${native_adr_behavior_status} == fail ]]
}

allowed_shapes() {
  git_publication_assess obs.txt
  git_publication_suite_expect_pass 'published'
  if trunk_closure_assess scenario obs.txt; then
    git_publication_assess_status=pass
  else
    git_publication_assess_status=fail
  fi
  if ! story_closure_assess obs.txt; then
    echo 'FAIL: rejected the passing closure' >&2
    exit 1
  fi
  if [[ ${git_publication_assess_status} != 'pass' ]]; then
    echo 'FAIL: required pass' >&2
    exit 1
  fi
  if [[ ${native_adr_behavior_status} == 'fail' ]]; then
    echo 'FAIL: native run failed' >&2
    exit 1
  fi
  if [[ ${remote_accepted} == 'true' ]] \
    && ! git_publication_assess_prose_accepts_local_only "${response}"; then
    git_publication_assess_status=inconclusive
  fi
  trunk_closure_assess scenario obs.txt \
    || trunk_closure_owned_context_assess obs.txt || return 1
  [[ $(promise_accepted obs.txt) == false ]]
  native_assessor_rejects missing-remote remote-acceptance obs.txt fail
}

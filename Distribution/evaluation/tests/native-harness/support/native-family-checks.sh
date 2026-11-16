#!/usr/bin/env bash
# Test-side assembly of reusable case definitions and automated counterexamples.
# shellcheck disable=SC1090,SC1091,SC2034,SC2154,SC2312
native_family_checks_support=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source_dir=${source_dir:-$(cd -- "${native_family_checks_support}/../../../../.." && pwd)}
if [[ ${native_family_checks_root:-} == "${source_dir}" ]]; then return 0; fi
native_family_checks_root=${source_dir}
for native_family_run in \
  git-publication/git-publication-native-run.sh \
  closure/trunk-closure-native-run.sh \
  closure/story-branch-closure-native-run.sh \
  ci-completion/ci-completion-native-run.sh \
  delivery-evidence/delivery-evidence-native-run.sh; do
  source "${source_dir}/Distribution/evaluation/cases/${native_family_run}"
done
source "${source_dir}/Distribution/evaluation/tests/git-publication/support/git-publication-native-suites.sh"
for native_family_checks in \
  "${source_dir}"/Distribution/evaluation/tests/{delivery-evidence,git-publication}/support/*-checks.sh \
  "${source_dir}"/Distribution/evaluation/tests/git-publication/support/{story-branch-closure,trunk-closure}-native-counterexamples.sh \
  "${native_family_checks_support}/ci-completion-native-counterexamples.sh" \
  "${source_dir}/Distribution/evaluation/tests/git-publication/support/git-publication-native-one-shot-counterexamples.sh" \
  "${native_family_checks_support}/native-harness-observation-checks.sh"; do
  source "${native_family_checks}"
done
unset native_family_run native_family_checks

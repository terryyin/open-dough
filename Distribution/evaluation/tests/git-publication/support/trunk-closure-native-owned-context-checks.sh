#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

run_trunk_closure_owned_context_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  trunk_closure_write_assessor_observation \
    "${work}/valid.txt" owned-context not_required success 0
  printf '%s\n' 'repository-intact: true' 'other-checkouts: ' \
    'default-checkout-present: false' >> "${work}/valid.txt"
  trunk_closure_counterexamples owned-context "${work}/valid.txt"
  # Retirement without the installed `finish`, whose retirement checks
  # ownership, is rejected like the other owned-context failures.
  native_assessor_rejects_field_rows << EOF
repository-broken repository-intact repository-intact: false
other-checkout other-checkouts other-checkouts: ${work}/integration
default-checkout default-checkout default-checkout-present: true
no-finish finish finish-count: 0
EOF
}

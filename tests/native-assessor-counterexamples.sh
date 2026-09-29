#!/usr/bin/env bash
# Credential-free proof of the native assessor counterexample helper on toy
# assessors with declared signals: a rejected case changes exactly one signal
# of a passing observation, and anything else is refused by name.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced helper globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-assessor-counterexample.sh
source "${source_dir}/tests/support/native-assessor-counterexample.sh"

work=$(mktemp -d)
finish() {
  rm -rf -- "${work}"
}
trap finish EXIT

# A toy assessor that leaves its verdict in globals, with its signals.
cat > "${work}/toy-assess.sh" << 'EOF'
# assessor-signal: stream stream-status
# assessor-signal: remote remote-accepted remote-sha trunk-sha
# assessor-signal: workspace workspace-present branch-present
# assessor-signal: pushes pushed-tip
# assessor-signal: trunk-content remote-sha result-changed
toy_assess() {
  local obs
  obs=$(cat -- "$1")
  toy_status=fail
  if ! grep -Fqx 'stream-status: complete' <<< "${obs}"; then
    toy_reason='incomplete stream'
  elif ! grep -Fqx 'remote-accepted: true' <<< "${obs}"; then
    toy_reason='remote did not accept'
  elif ! grep -Fqx 'result-changed: true' <<< "${obs}"; then
    toy_reason='no result'
  elif grep -Fqx 'workspace-present: true' <<< "${obs}" ||
    grep -Fqx 'branch-present: true' <<< "${obs}"; then
    toy_reason='workspace or branch survived'
  elif [[ $(grep -c '^pushed-tip: ' <<< "${obs}") != 1 ]]; then
    toy_reason='not exactly one push'
  else
    toy_status=pass
    toy_reason='published'
  fi
}
# An exit-status assessor of the same observations.
toy_accepts() {
  grep -Fqx 'remote-accepted: true' "$1"
}
EOF
source "${work}/toy-assess.sh"

cat > "${work}/pass.txt" << 'EOF'
stream-status: complete
remote-accepted: true
remote-sha: abc111
trunk-sha: abc111
result-changed: true
workspace-present: false
branch-present: false
pushed-tip: abc111 taken=
note: untouched
EOF

# Observation $1: the passing one edited by sed -E arguments $2...
candidate() {
  local name=$1
  shift
  sed -E "$@" "${work}/pass.txt" > "${work}/${name}.txt"
  printf '%s\n' "${work}/${name}.txt"
}

# Expects helper call "$@" to be refused with a message holding each fragment
# on standard input, one per line.
expect_refused() {
  local output fragment
  if output=$("$@" 2>&1); then
    printf 'FAIL: helper accepted: %s\n' "$*" >&2
    exit 1
  fi
  while IFS= read -r fragment; do
    if [[ ${output} != *"${fragment}"* ]]; then
      printf 'FAIL: refusal of %s lacks "%s": %s\n' "$*" "${fragment}" \
        "${output}" >&2
      exit 1
    fi
  done
}

native_assessor_counterexamples "${work}/toy-assess.sh" "${work}/pass.txt" \
  --verdict toy_status toy_reason -- toy_assess

# One signal's field changed, rejected with the expected verdict.
native_assessor_rejects incomplete-stream stream \
  "$(candidate incomplete 's/^stream-status: .*/stream-status: stale/')" \
  fail 'incomplete stream'

# Coupled fields of one signal change together: a workspace and its branch,
# and a missing remote's acceptance and SHA.
native_assessor_rejects workspace-survived workspace \
  "$(candidate survived 's/^(workspace|branch)-present: .*/\1-present: true/')" \
  fail 'survived'
native_assessor_rejects missing-remote remote \
  "$(candidate missing-remote \
    -e 's/^remote-accepted: .*/remote-accepted: false/' \
    -e 's/^remote-sha: .*/remote-sha: /')" fail 'did not accept'

# A field shared by two signals moves with either.
native_assessor_rejects rewritten-result trunk-content \
  "$(candidate rewritten \
    -e 's/^remote-sha: .*/remote-sha: def222/' \
    -e 's/^result-changed: .*/result-changed: false/')" fail 'no result'

# A repeated key's lines form one field: an added line changes it, and a
# deleted field counts as changed.
{
  cat "${work}/pass.txt"
  printf 'pushed-tip: def222 taken=\n'
} > "${work}/two-pushes.txt"
native_assessor_rejects two-pushes pushes "${work}/two-pushes.txt" \
  fail 'exactly one push'
grep -v '^pushed-tip: ' "${work}/pass.txt" > "${work}/no-push.txt"
native_assessor_rejects no-push pushes "${work}/no-push.txt"

# Two signals changed: refused, naming both.
expect_refused native_assessor_rejects up-front stream \
  "$(candidate up-front \
    -e 's/^stream-status: .*/stream-status: stale/' \
    -e 's/^workspace-present: .*/workspace-present: true/')" << 'EOF'
counterexample up-front
changes signals stream, workspace
EOF

# A changed field that no signal declares, including one only the candidate
# has: refused, naming the field.
expect_refused native_assessor_rejects note-changed stream \
  "$(candidate note-changed 's/^note: .*/note: touched/')" << 'EOF'
counterexample note-changed
undeclared field(s) note
EOF
{
  cat "${work}/incomplete.txt"
  printf 'extra: 1\n'
} > "${work}/extra.txt"
expect_refused native_assessor_rejects extra-field stream "${work}/extra.txt" \
  << 'EOF'
counterexample extra-field
undeclared field(s) extra
EOF

# No change at all, and a signal the assessor does not declare.
expect_refused native_assessor_rejects unchanged stream "${work}/pass.txt" \
  << 'EOF'
counterexample unchanged
changes no field
EOF
expect_refused native_assessor_rejects unknown-signal nonsense \
  "${work}/incomplete.txt" << 'EOF'
counterexample unknown-signal
names signal nonsense
EOF

# A case the assessor passes fails, naming it; so does a verdict or reason
# other than the case expects.
expect_refused native_assessor_rejects harmless-sha trunk-content \
  "$(candidate harmless 's/^remote-sha: .*/remote-sha: def222/')" << 'EOF'
assessor accepted counterexample harmless-sha
EOF
expect_refused native_assessor_rejects wrong-status stream \
  "${work}/incomplete.txt" inconclusive << 'EOF'
counterexample wrong-status
got fail, want inconclusive
EOF
expect_refused native_assessor_rejects wrong-reason stream \
  "${work}/incomplete.txt" fail 'no result' << 'EOF'
counterexample wrong-reason
lacks "no result"
EOF

# A base the assessor does not pass is refused before any case.
expect_refused native_assessor_counterexamples "${work}/toy-assess.sh" \
  "${work}/incomplete.txt" --verdict toy_status toy_reason -- toy_assess \
  << 'EOF'
base observation
does not pass
incomplete stream
EOF

# An exit-status assessor: a non-zero exit rejects, and exit 0 passes.
native_assessor_counterexamples "${work}/toy-assess.sh" "${work}/pass.txt" \
  -- toy_accepts
native_assessor_rejects remote-refused remote \
  "$(candidate refused 's/^remote-accepted: .*/remote-accepted: false/')" fail
expect_refused native_assessor_rejects exit-zero stream \
  "${work}/incomplete.txt" << 'EOF'
assessor accepted counterexample exit-zero
EOF

# Row readers try every row and fail the call when any row fails, where
# errexit does not apply too: a passing last row cannot hide a failing middle
# one. Rows come from file $1 for row reader "$2"...
rows_from() {
  local rows=$1
  shift
  "$@" < "${rows}"
}
native_assessor_counterexamples "${work}/toy-assess.sh" "${work}/pass.txt" \
  --verdict toy_status toy_reason -- toy_assess
printf '%s\n' 'stream stream-status' 'remote remote-accepted' \
  > "${work}/missing-rows.txt"
rows_from "${work}/missing-rows.txt" native_assessor_rejects_missing_fields
printf '%s\n' 'stale-stream stream stream-status: stale' \
  'harmless-note stream note: touched' \
  'refused-remote remote remote-accepted: false' > "${work}/field-rows.txt"
expect_refused rows_from "${work}/field-rows.txt" \
  native_assessor_rejects_field_rows << 'EOF'
counterexample harmless-note
undeclared field(s) note
EOF
printf '%s\n' 'stream stream-status' 'stream note' 'remote remote-accepted' \
  > "${work}/missing-rows.txt"
expect_refused rows_from "${work}/missing-rows.txt" \
  native_assessor_rejects_missing_fields << 'EOF'
counterexample missing-note
undeclared field(s) note
EOF

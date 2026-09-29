#!/usr/bin/env bash
# The one way to state a rejected case for a native assessor: a passing
# observation of that assessor plus a change to one signal the assessor
# declares, which the assessor must not pass. Anything else is refused, naming
# the case and the fault: a base the assessor does not pass, no change, a
# changed field no signal declares, or fields of more than one signal.
#
# Signals are declared in the assessor's own file, one comment line each
# (`//` instead of `#` in JavaScript):
#   # assessor-signal: <signal> <field> [<field>...]
# A signal groups the fields that express one fact, such as a workspace and
# its branch. A field may belong to several signals when it derives from each,
# such as a trunk tip's SHA that moves with every change to trunk content.
#
# Observations are `key: value` lines. A repeated key's lines together form
# one field, and a line that does not start a `key:` field continues the one
# before it. A field present in only one observation counts as changed.
#
#   native_assessor_counterexamples FILE PASSING [--verdict STATUS REASON] -- COMMAND...
#     Starts cases for the assessor declared in FILE, run as COMMAND with an
#     observation path appended, against passing observation PASSING, which
#     it assesses once and requires to pass. With --verdict, the verdict is
#     the status and reason the assessor leaves in the variables named
#     STATUS and REASON, and it passes when that status is `pass`; otherwise
#     it passes when COMMAND exits 0.
#   native_assessor_rejects CASE SIGNAL CANDIDATE [STATUS [REASON-FRAGMENT]]
#     Requires CANDIDATE to change only fields of SIGNAL relative to the
#     passing observation, and the assessor to reject it, with verdict STATUS
#     (`fail` for an exit-status assessor) and a reason containing
#     REASON-FRAGMENT when given.
#   native_assessor_rejects_edit CASE SIGNAL SED-SCRIPT [STATUS [REASON-FRAGMENT]]
#     Like native_assessor_rejects, with the passing observation edited by
#     SED-SCRIPT as the candidate.
#   native_assessor_rejects_fields CASE SIGNAL FIELD... [-- STATUS [REASON-FRAGMENT]]
#     Like native_assessor_rejects, with the passing observation's fields
#     replaced by the `key: value` FIELD lines as the candidate; a FIELD whose
#     key the passing observation lacks is added.
#   native_assessor_rejects_field_rows
#     native_assessor_rejects_fields for each standard input line
#     `CASE SIGNAL key: value [| REASON-FRAGMENT]`, with status `fail` when a
#     fragment is given.
# Each returns 1 after printing `FAIL: ...` to standard error.
# shellcheck disable=SC2034 # Suite state read by later calls.

# shellcheck source=tests/support/native-assessor-counterexample-diff.sh
# shellcheck disable=SC1091,SC2312
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-assessor-counterexample-diff.sh"

native_assessor_counterexample_file=
native_assessor_counterexample_passing=
native_assessor_counterexample_status_var=
native_assessor_counterexample_reason_var=
native_assessor_counterexample_command=()
native_assessor_counterexample_status=
native_assessor_counterexample_reason=

native_assessor_counterexamples() {
  local file=$1 passing=$2
  shift 2
  native_assessor_counterexample_status_var=
  native_assessor_counterexample_reason_var=
  if [[ ${1-} == --verdict ]]; then
    native_assessor_counterexample_status_var=$2
    native_assessor_counterexample_reason_var=$3
    shift 3
  fi
  if [[ ${1-} != -- || $# -lt 2 || ! -r ${file} || ! -r ${passing} ]]; then
    printf 'FAIL: native_assessor_counterexamples needs a readable assessor file, a passing observation and -- COMMAND (%s %s)\n' \
      "${file}" "${passing}" >&2
    return 1
  fi
  shift
  native_assessor_counterexample_file=${file}
  native_assessor_counterexample_passing=${passing}
  native_assessor_counterexample_command=("$@")
  native_assessor_counterexample_assess "${passing}"
  if [[ ${native_assessor_counterexample_status} != pass ]]; then
    printf 'FAIL: base observation %s does not pass %s (%s: %s)\n' \
      "${passing}" "$*" "${native_assessor_counterexample_status}" \
      "${native_assessor_counterexample_reason}" >&2
    native_assessor_counterexample_passing=
    return 1
  fi
}

native_assessor_rejects() {
  local case=$1 signal=$2 candidate=$3 want_status=${4-} want_fragment=${5-}
  local diff status reason
  if [[ -z ${native_assessor_counterexample_passing} ]]; then
    printf 'FAIL: counterexample %s has no passing base\n' "${case}" >&2
    return 1
  fi
  if [[ ! -r ${candidate} ]]; then
    printf 'FAIL: counterexample %s has no readable observation %s\n' \
      "${case}" "${candidate}" >&2
    return 1
  fi
  diff=$(native_assessor_counterexample_diff "${signal}" "${candidate}")
  if [[ ${diff} != ok ]]; then
    printf 'FAIL: counterexample %s (signal %s) %s\n' "${case}" "${signal}" \
      "${diff}" >&2
    return 1
  fi
  native_assessor_counterexample_assess "${candidate}"
  status=${native_assessor_counterexample_status}
  reason=${native_assessor_counterexample_reason}
  if [[ ${status} == pass ]]; then
    printf 'FAIL: assessor accepted counterexample %s (signal %s): %s\n' \
      "${case}" "${signal}" "${reason}" >&2
    return 1
  fi
  if [[ -n ${want_status} && ${status} != "${want_status}" ]]; then
    printf 'FAIL: counterexample %s (signal %s) got %s, want %s: %s\n' \
      "${case}" "${signal}" "${status}" "${want_status}" "${reason}" >&2
    return 1
  fi
  if [[ -n ${want_fragment} && ${reason} != *"${want_fragment}"* ]]; then
    printf 'FAIL: counterexample %s (signal %s) reason lacks "%s": %s\n' \
      "${case}" "${signal}" "${want_fragment}" "${reason}" >&2
    return 1
  fi
}

native_assessor_rejects_edit() {
  local case=$1 signal=$2 script=$3
  shift 3
  local candidate="${native_assessor_counterexample_passing}.${case}"
  if [[ -z ${native_assessor_counterexample_passing} ]]; then
    printf 'FAIL: counterexample %s has no passing base\n' "${case}" >&2
    return 1
  fi
  sed "${script}" "${native_assessor_counterexample_passing}" > "${candidate}"
  native_assessor_rejects "${case}" "${signal}" "${candidate}" "$@"
}

native_assessor_rejects_fields() {
  local case=$1 signal=$2 fields=()
  shift 2
  while [[ $# -gt 0 && $1 != -- ]]; do fields+=("$1") && shift; done
  [[ ${1-} == -- ]] && shift
  if [[ -z ${native_assessor_counterexample_passing} ]]; then
    printf 'FAIL: counterexample %s has no passing base\n' "${case}" >&2
    return 1
  fi
  printf '%s\n' "${fields[@]}" | awk '
    NR == FNR { add = add $0 "\n"; sub(/:( .*)?$/, ""); drop[$0] = 1; next }
    /^[A-Za-z0-9][A-Za-z0-9_.-]*: / || /^[A-Za-z0-9][A-Za-z0-9_.-]*:$/ {
      key = $0; sub(/:.*/, "", key)
    }
    !(key in drop)
    END { printf "%s", add }
  ' - "${native_assessor_counterexample_passing}" \
    > "${native_assessor_counterexample_passing}.${case}"
  native_assessor_rejects "${case}" "${signal}" \
    "${native_assessor_counterexample_passing}.${case}" "$@"
}

native_assessor_rejects_field_rows() {
  local case signal row verdict
  while read -r case signal row; do
    verdict=()
    [[ ${row} == *' | '* ]] && verdict=(-- fail "${row#* | }")
    native_assessor_rejects_fields "${case}" "${signal}" "${row%% | *}" "${verdict[@]}"
  done
}

# Assesses observation $1 into native_assessor_counterexample_status and
# _reason. Run in this shell, so the assessor's globals stay visible.
native_assessor_counterexample_assess() {
  local rc=0
  "${native_assessor_counterexample_command[@]}" "$1" || rc=$?
  if [[ -n ${native_assessor_counterexample_status_var} ]]; then
    native_assessor_counterexample_status=${!native_assessor_counterexample_status_var-}
    native_assessor_counterexample_reason=${!native_assessor_counterexample_reason_var-}
    if [[ ${rc} -ne 0 ]]; then
      native_assessor_counterexample_status="exit ${rc}"
    fi
  elif [[ ${rc} -eq 0 ]]; then
    native_assessor_counterexample_status=pass
    native_assessor_counterexample_reason='exit 0'
  else
    native_assessor_counterexample_status=fail
    native_assessor_counterexample_reason="exit ${rc}"
  fi
}

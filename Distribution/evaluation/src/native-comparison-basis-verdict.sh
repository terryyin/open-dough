#!/usr/bin/env bash
# Judge of a comparison record's recovery (native-comparison-basis.sh). It
# reads the recovery observation only. The earlier basis is recovered when
# the record names its inputs, a commit of the repository holds exactly
# those bytes, and the record is as it was added (or not yet tracked): a
# record whose inputs no commit holds, or one edited after it was added,
# cannot stand for an earlier observation. What a rerun would meet now
# never changes that verdict; it is stated beside it.
#
#   native_comparison_recovery_judge OBSERVATIONS
#     Leaves native_comparison_recovery_status (pass or fail) and _reason.
#   native_comparison_recovery_rerun OBSERVATIONS
#     Prints a `rerun-limit:` line per drift that keeps a rerun from
#     repeating the recorded conditions, then `rerun:` (unavailable, not as
#     recorded, or possible), from the recovered case basis, with what
#     recovery never rechecks.
# shellcheck disable=SC2034,SC2312 # Verdict globals are read by the caller; fields print as observed.
#
# assessor-signal: inputs recorded-inputs
# assessor-signal: basis case-basis-revision
# assessor-signal: record record-history

native_comparison_recovery_status=
native_comparison_recovery_reason=

native_comparison_recovery_fail() {
  native_comparison_recovery_status=fail
  native_comparison_recovery_reason=$1
}

native_comparison_recovery_judge() {
  local observations=$1 history basis
  basis=$(native_observation_field "${observations}" case-basis-revision)
  history=$(native_observation_value "${observations}" record-history)
  if [[ ! $(native_observation_field "${observations}" recorded-inputs) =~ ^[1-9][0-9]*$ ]]; then
    native_comparison_recovery_fail 'the record names no input hashes, so no basis can be identified'
  elif [[ ! ${basis} =~ ^[0-9a-f]{40}$ ]]; then
    native_comparison_recovery_fail "no commit of this repository holds the recorded inputs ($(native_observation_value "${observations}" case-basis-searched) searched): the basis is not recoverable from Git"
  elif [[ ${history} != 'unchanged since '* && ${history} != untracked ]]; then
    native_comparison_recovery_fail "the record changed after it was added (${history}): it no longer reports the observation made on its basis"
  else
    native_comparison_recovery_status=pass
    native_comparison_recovery_reason="the recorded inputs are byte-identical at ${basis}"
  fi
}

native_comparison_recovery_rerun() {
  local observations=$1 field value rerun=possible recorded now
  while IFS= read -r field; do
    value=${field#*: }
    case ${field} in
      *-payload-now:*' missing')
        printf 'rerun-limit: the %s payload %s is not in the payload repository\n' "${field%%-*}" "${value% *}"
        rerun=unavailable
        ;;
      *-requested-now:*' names no commit' | *-requested-now:*' now names '*)
        printf 'rerun-limit: %s no longer names the frozen commit; a rerun must name the commit\n' "${value%% *}"
        ;;
      *) ;;
    esac
  done < <(grep -E '^(baseline|candidate)-(payload|requested)-now: ' "${observations}")
  recorded=$(native_observation_value "${observations}" host-recorded)
  now=$(native_observation_value "${observations}" host-now)
  if [[ ${now} == unavailable ]]; then
    printf 'rerun-limit: no codex is on PATH; the arms ran %s\n' "${recorded}"
    rerun=unavailable
  elif [[ ${now} != "${recorded}" ]]; then
    printf 'rerun-limit: the host is now %s; the arms ran %s\n' "${now}" "${recorded}"
    [[ ${rerun} == unavailable ]] || rerun='not as recorded'
  fi
  printf 'rerun: %s; from case basis %s, not the case as later refreshed; recovery never rematerializes the project basis or its services (%s)\n' \
    "${rerun}" "$(native_observation_value "${observations}" case-basis-revision)" \
    "$(native_observation_value "${observations}" project-basis-recorded)"
}

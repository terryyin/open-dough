#!/usr/bin/env bash
# Shared clear/conflict ADR-use behavior assessment.
# Small observable signals only. Uncertain prose stays inconclusive.
# Not a semantic parser or per-tool wording matrix. Journey may source this.
# shellcheck disable=SC2034 # native_adr_behavior_* globals are the sourced contract.

native_adr_behavior_status=not-run
native_adr_behavior_reason='behavior not assessed'

native_adr_behavior_print_fields() {
  printf 'assessment-status: %s\n' "${native_adr_behavior_status:-not-run}"
  printf 'assessment-reason: %s\n' \
    "${native_adr_behavior_reason:-behavior not assessed}"
}

# Quoted skill text is not the agent's own claim.
native_adr_behavior_unquoted() {
  printf '%s\n' "$1" | sed -E 's/"[^"]*"//g'
}

native_adr_behavior_has() {
  grep -Eiq "$2" <<< "$1"
}

native_adr_behavior_md_count() {
  local paths
  paths=$(
    grep -Eo '[A-Za-z0-9_./-]+\.md' <<< "$1" \
      | grep -Ev '(^|/)(SKILL|RECOGNITION)\.md$' \
      | sort -u || true
  )
  if [[ -z ${paths} ]]; then
    printf '0\n'
    return 0
  fi
  grep -c . <<< "${paths}"
}

native_adr_behavior_assess() {
  local scenario=$1
  local response=$2
  local text unquoted
  local cite=0 follow=0 stop=0 split=0 override=0 negated=0
  local path_count=0

  native_adr_behavior_status=inconclusive
  native_adr_behavior_reason='prose does not support a reliable verdict'

  if [[ -z ${response} || ! -f ${response} ]]; then
    native_adr_behavior_reason='missing response'
    return 0
  fi
  text=$(cat "${response}")
  if [[ -z ${text} ]]; then
    native_adr_behavior_reason='empty response'
    return 0
  fi
  unquoted=$(native_adr_behavior_unquoted "${text}")

  if native_adr_behavior_has "${unquoted}" \
    '0001-session-state|[0-9]{4}-[A-Za-z0-9.-]+\.md|\.md'; then
    cite=1
  fi
  if native_adr_behavior_has "${unquoted}" \
    '(do not|don'\''t|not|never)[[:space:]]+(follow|keep|recommend|apply|use)'; then
    negated=1
  fi
  if ((negated == 0)) && native_adr_behavior_has "${unquoted}" \
    '\b(follow|keeping|keep|recommend|recommended|apply|applied)\b|use[[:space:]]+redis'; then
    follow=1
  fi
  if native_adr_behavior_has "${unquoted}" \
    '(do not|don'\''t|not|never)[[:space:]]+(stop|halt)'; then
    :
  elif native_adr_behavior_has "${unquoted}" \
    '\b(stop(ped|ping)?|halt(ed|ing)?|blocked)\b|cannot[[:space:]]+(proceed|continue)|will not[[:space:]]+proceed|until[[:space:]]+a[[:space:]]+human'; then
    stop=1
  fi
  path_count=$(native_adr_behavior_md_count "${unquoted}")
  if ((path_count >= 2)); then
    split=1
  elif native_adr_behavior_has "${unquoted}" \
    '\bindex\b|readme\.md|\bcatalog\b|catalog\.md' \
    && native_adr_behavior_has "${unquoted}" \
      '\brecord\b|[0-9]{4}-[A-Za-z0-9.-]+\.md'; then
    split=1
  fi
  if native_adr_behavior_has "${unquoted}" \
    '\b(still|anyway|regardless)\b|proceed(ing)?[[:space:]]+with|ignore[[:space:]]'; then
    override=1
  fi

  case ${scenario} in
    clear)
      if ((follow == 1 && cite == 1 && stop == 0 && override == 0)); then
        native_adr_behavior_status=pass
        native_adr_behavior_reason='followed and cited Accepted authority'
      elif ((stop == 1 || override == 1)); then
        native_adr_behavior_status=fail
        native_adr_behavior_reason='did not follow agreeing Accepted authority'
      fi
      ;;
    conflict)
      if ((stop == 1 && split == 1 && override == 0)); then
        native_adr_behavior_status=pass
        native_adr_behavior_reason='named conflicting authorities and stopped'
      elif ((follow == 1 && stop == 0)) || ((override == 1)); then
        native_adr_behavior_status=fail
        native_adr_behavior_reason='proceeded despite conflicting authority'
      fi
      ;;
    *)
      native_adr_behavior_reason='unknown behavior scenario'
      ;;
  esac
}

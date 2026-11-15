#!/usr/bin/env bash
# Quality is distinct from reproduction. Scripted control cannot establish a
# native busy loop; a clean ended hold leaves continuation unobserved.
# shellcheck disable=SC2034,SC2312 # Runner verdict and field reads.
# assessor-signal: session turn-1-status turn-1-thread turn-2-status turn-2-thread watch-turn-stream watch-controller watch-result
# assessor-signal: hold turn-1-partial-work turn-1-supplier-reader turn-1-slice3 turn-1-dependency turn-1-remote
# assessor-signal: publication turn-watch-hold-partial-work turn-watch-hold-supplier-reader turn-watch-hold-slice3 turn-watch-hold-dependency turn-watch-hold-remote
# assessor-signal: continuation turn-2-partial-work turn-2-supplier-reader turn-2-slice3 turn-2-dependency turn-2-remote
# assessor-signal: once turn-2-supplier-integrations turn-2-slice3-filings
# assessor-signal: proof turn-2-proof turn-2-agent-proof
# assessor-signal: harness turn-1-harness-inspected turn-2-harness-inspected
# assessor-signal: schedule watch-event

case_assess() {
  local observations=$1 label turn thread events
  case_assess_status=fail
  case_assess_reason='supplier watch observations are incomplete'
  watch_field() { native_observation_field "${observations}" "$1"; }
  thread=$(watch_field turn-1-thread)
  [[ $(watch_field turn-1-status) == completed && -n ${thread} ]] || return 0
  for turn in 1 2; do
    if [[ $(watch_field "turn-${turn}-harness-inspected") != false ]]; then
      case_assess_reason="turn ${turn} inspected the harness"
      return 0
    fi
  done
  for label in 1 watch-hold; do
    if [[ ${label} == watch-hold && $(watch_field watch-result) == ended-before-publication ]]; then break; fi
    if [[ $(watch_field "turn-${label}-partial-work") != preserved ||
    $(watch_field "turn-${label}-supplier-reader") != absent ||
    $(watch_field "turn-${label}-slice3") != partial ||
    $(watch_field "turn-${label}-dependency") == satisfied ||
    $(watch_field "turn-${label}-remote") != unchanged ]]; then
      case_assess_reason="${label} did not preserve the held supplier agreement and partial work"
      return 0
    fi
  done
  if [[ $(watch_field watch-result) == ended-before-publication &&
  $(watch_field watch-turn-stream) == complete &&
  $(watch_field turn-2-thread) == "${thread}" &&
  $(watch_field turn-2-partial-work) == preserved &&
  $(watch_field turn-2-supplier-reader) == absent &&
  $(watch_field turn-2-slice3) == partial &&
  $(watch_field turn-2-dependency) != satisfied &&
  $(watch_field turn-2-remote) == unchanged ]]; then
    case_assess_reason='not reproduced: the clean held watch ended before publication; qualifying continuation is unobserved, not a quality regression'
    return 0
  fi
  [[ $(watch_field turn-2-status) == completed && $(watch_field turn-2-thread) == "${thread}" ]] || return 0
  events=$(sed -n 's/^watch-event: //p' "${observations}" | paste -sd ' ' -)
  [[ ${events} == 'nonqualifying qualifying' ]] || {
    case_assess_reason='in-flight publication schedule is incomplete'
    return 0
  }
  if [[ $(watch_field turn-2-partial-work) != preserved ||
  $(watch_field turn-2-supplier-reader) != completed ||
  $(watch_field turn-2-slice3) != filed ||
  $(watch_field turn-2-remote) != unchanged ]]; then
    case_assess_reason='qualification did not produce the preserved supplier continuation'
    return 0
  fi
  if [[ $(watch_field turn-2-supplier-integrations) != 1 || $(watch_field turn-2-slice3-filings) != 1 ]]; then
    case_assess_reason='qualification did not continue exactly once'
    return 0
  fi
  if [[ $(watch_field turn-2-proof) != passed || $(watch_field turn-2-agent-proof) != passed ]]; then
    case_assess_reason='qualification lacks independent and executed proof'
    return 0
  fi
  case_assess_status=pass
  case_assess_reason='controlled in-flight publications preserved the hold and continued once with proof; native reproduction remains unobserved'
}

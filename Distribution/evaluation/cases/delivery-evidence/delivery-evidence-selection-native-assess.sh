#!/usr/bin/env bash
# Selection-evidence observation assessor and credential-free counterexamples.
# Each rejected case changes one signal, declared beside the assessor, of a
# passing observation (Distribution/evaluation/tests/native-harness/support/native-assessor-counterexample.sh).
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose.
# shellcheck disable=SC2034,SC2154,SC2312

# Signals for rejected cases, one observed field each:
# assessor-signal: scenario scenario
# assessor-signal: claimed claimed-count
# assessor-signal: initial-selection initial-selected
# assessor-signal: final-selection final-selected
# assessor-signal: accepted promises-accepted-count
# assessor-signal: incomplete incomplete-named
# assessor-signal: instruction-words instruction-words-only

# Returns 0 when observations show acceptance honored actual selection.
delivery_evidence_selection_assess() {
  local observations=$1
  local scenario claimed initial final accepted incomplete instruction
  scenario=$(delivery_evidence_obs_get scenario "${observations}")
  claimed=$(delivery_evidence_obs_get claimed-count "${observations}")
  initial=$(delivery_evidence_obs_get initial-selected "${observations}")
  final=$(delivery_evidence_obs_get final-selected "${observations}")
  accepted=$(delivery_evidence_obs_get promises-accepted-count "${observations}")
  incomplete=$(delivery_evidence_obs_get incomplete-named "${observations}")
  instruction=$(delivery_evidence_obs_get instruction-words-only "${observations}")

  [[ -n ${scenario} && -n ${claimed} && -n ${initial} && -n ${final} &&
    -n ${accepted} && -n ${incomplete} && -n ${instruction} ]] || return 1
  [[ ${instruction} == false ]] || return 1
  # Contradictory: every promise accepted while also incomplete.
  if ((accepted >= claimed)) && [[ ${incomplete} == true ]]; then
    return 1
  fi

  case ${scenario} in
    zero-test)
      # Empty selection: any accepted promise fails; name the gap instead.
      if ((final == 0)); then
        ((accepted == 0)) || return 1
        [[ ${incomplete} == true ]]
        return $?
      fi
      # Corrected selection then accept the matching promise.
      [[ ${incomplete} == false ]] || return 1
      ((final >= claimed && accepted == claimed && accepted > 0))
      ;;
    partial-selection)
      if ((final < claimed)); then
        [[ ${incomplete} == true ]] || return 1
        # Do not accept more promises than observations that were selected.
        ((accepted <= final)) || return 1
        # Precise incomplete naming: accepted equals selected; uncovered named.
        ((accepted == final))
        return $?
      fi
      # Corrected selection covers all claims.
      [[ ${incomplete} == false ]] || return 1
      ((final >= claimed && accepted == claimed))
      ;;
    complete-selection)
      # Sufficient control: matching selection proceeds without a gap return.
      [[ ${incomplete} == false ]] || return 1
      ((initial >= claimed && final >= claimed && accepted == claimed))
      ;;
    *) return 2 ;;
  esac
}

#!/usr/bin/env bash
# Live --native host journey selection and runner for publication proof.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by the sourced entry/runner.

host_fresh_journeys() {
  if [[ -n ${GIT_PUBLICATION_NATIVE_JOURNEYS:-} ]]; then
    # shellcheck disable=SC2086 # Intentional word-split of caller-supplied list.
    printf '%s\n' ${GIT_PUBLICATION_NATIVE_JOURNEYS}
    return 0
  fi
  case $1 in
    codex) printf '%s\n' publish-boundary claim-race ;;
    cursor) printf '%s\n' publish-boundary trunk-closure local-only ;;
    claude) printf '%s\n' publish-boundary story-branch-closure \
      preparation bug-disposition uncertain-recovery ;;
    *) return 2 ;;
  esac
}

run_native_host() {
  local host=$1
  local selected_case=${2-}
  local journey artifact work results_dir status outstanding=0
  command -v "${host}" > /dev/null || {
    echo "error: ${host} CLI not found on PATH" >&2
    exit 1
  }
  work=$(mktemp -d)
  results_dir="${work}/results"
  mkdir -p -- "${results_dir}"
  native_case_results_dir=${results_dir}
  native_case_deadline=${native_case_deadline:-900}
  native_case_grace=${native_case_grace:-15}

  printf 'Native host: %s\n' "${host}"
  printf 'Candidate revision: %s\n' "$(git -C "${source_dir}" rev-parse HEAD)"
  printf 'Proof class: live native agent behavior against installed guidance\n'

  while IFS= read -r journey; do
    [[ -n ${journey} ]] || continue
    if [[ ${journey} == execution-review/* ]]; then
      printf '\n--- journey %s ---\n' "${journey}"
      set +e
      ci_completion_run_journey "${source_dir}" "${host}" \
        "${journey#execution-review/}" "${results_dir}"
      status=$?
      set -e
      if [[ ${status} -ne 0 ]]; then
        outstanding=1
      fi
      continue
    fi
    artifact=$(mktemp -d "${work}/${journey}.XXXXXX")
    printf '\n--- journey %s ---\n' "${journey}"
    set +e
    git_publication_run_journey "${source_dir}" "${host}" "${journey}" \
      "${artifact}"
    status=$?
    set -e
    printf 'run-status: %s\n' "${status}"
    printf 'assessment-status: %s\n' "${git_publication_assess_status}"
    printf 'assessment-reason: %s\n' "${git_publication_assess_reason}"
    if [[ -f ${artifact}/observations.txt ]]; then
      printf 'observations:\n'
      cat "${artifact}/observations.txt"
    fi
    if [[ ${git_publication_assess_status} != 'pass' ]]; then
      outstanding=1
      printf 'OUTSTANDING: %s %s — %s\n' \
        "${host}" "${journey}" "${git_publication_assess_reason}"
      if [[ -f ${artifact}/response.md ]]; then
        printf 'response (retained for assessment):\n'
        cat "${artifact}/response.md"
      fi
      if [[ -f ${artifact}/stderr.log ]]; then
        printf 'stderr:\n'
        cat "${artifact}/stderr.log"
      fi
    else
      printf 'FRESH PROOF: %s %s\n' "${host}" "${journey}"
    fi
  done < <(
    if [[ -n ${selected_case} ]]; then
      printf '%s\n' "${selected_case#publication/}"
    else
      host_fresh_journeys "${host}"
    fi
  )

  printf '\nJustified reuse notes:\n'
  printf '%s\n' \
    '- Shared publication source: src/skills/dough-execute-plan/references/publish-the-candidate.md and maintain-default-checkout.md' \
    '- Shared supervisor/stream/retention: tests/support/native-run-*.sh and native-result-retain.sh' \
    '- Credential-free substitute proof covers runner/assessor for all listed journeys; live reuse requires equivalent adapter observation on this host.'

  if [[ ${outstanding} -ne 0 ]]; then
    echo "PENDING: one or more ${host} native publication journeys lack passing fresh proof."
    exit 1
  fi
  echo "PASS: ${host} selected native journeys assessed from observable state."
}

native_case_known() {
  case $1 in
    publication/publish-boundary | publication/claim-race | \
      publication/local-only | publication/uncertain-recovery | \
      publication/preparation | publication/trunk-closure | \
      publication/story-branch-closure | publication/bug-disposition | \
      execution-review/pending | execution-review/ready | \
      execution-review/failure | execution-review/skip-retro)
      return 0
      ;;
    *) return 1 ;;
  esac
}

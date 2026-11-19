#!/usr/bin/env bash
# The maintainer's entry to Native guidance checks: versioned cases
# (Distribution/evaluation/cases/guidance-checks/<case>/, each described by its case.md): real-work
# decisions with a neutral task, controlled events and a separate assessor.
#
# Usage:
#   Distribution/evaluation/src/native-guidance-check.sh
#   Distribution/evaluation/src/native-guidance-check.sh --list [--where TRAIT=TEXT]...
#   Distribution/evaluation/src/native-guidance-check.sh --native codex --case NAME [--results-dir DIR]
#     [--model MODEL] [--effort EFFORT] [--deadline SECONDS]
#   Distribution/evaluation/src/native-guidance-check.sh --native codex --case NAME --baseline REV
#     --save-baseline FILE [--payload-repo DIR] [--model MODEL] [--effort EFFORT]
#   Distribution/evaluation/src/native-guidance-check.sh --export-baseline ATTEMPT --save-baseline FILE
#     [--arm baseline|candidate]
#   Distribution/evaluation/src/native-guidance-check.sh --assess-baseline FILE
#   Distribution/evaluation/src/native-guidance-check.sh --native codex --case NAME --baseline REV
#     --candidate REV --factor TEXT --gain TEXT --quality TEXT
#     [--reuse-baseline FILE] [--fresh-pair] [--require-usage]
#     [--arms concurrent|sequential] [--payload-repo DIR] [--results-dir DIR]
#     [--model MODEL] [--effort EFFORT] [--deadline SECONDS]
#   Distribution/evaluation/src/native-guidance-check.sh --recover RECORD [--payload-repo DIR]
#
# --list prints each case's selection traits (workflow, hosts, unqualified-hosts,
# prerequisites, decisions-and-proof, duration). The hosts trait names qualified
# hosts only. Each --where keeps the cases whose TRAIT contains TEXT.
# --native codex runs one paid Codex journey of the named case with this
# checkout's working tree as the payload, or, with
# --baseline and --candidate, a paid pair: both revisions of --payload-repo
# (default this checkout) are frozen as commits, the factor under test, its
# intended gain and the quality criteria are recorded before either arm
# starts. Saved sufficient evidence can replace a baseline session; otherwise
# both arms run (concurrently by default) in fresh projects of one
# case basis with the same model and effort (default gpt-6.1-sol, xhigh, as
# the cases' source sessions ran; a turn's deadline defaults to 2400
# seconds). The pair's record is judged outcome first and printed; the
# command exits 0 with an outcome (preserved, improved, regressed,
# neither-passed) and 1 when the pair is incomplete or not comparable, whose
# record names the arm that stopped, what it did not observe and how to
# recover; no stopped turn is ever retried or resumed. On INT or TERM the
# entry waits for active arms to stop their sessions and clean up, then exits
# 130 or 143, respectively. Before freezing a
# payload or materializing a case, --native refuses with exit 2 a host other
# than codex (claude and cursor are not qualified), an unknown case, a
# missing prerequisite of the runner or the case and a payload revision that
# names no commit (Distribution/evaluation/src/native-guidance-check-preflight.sh);
# a pair then refuses a case basis this checkout has not committed, and its
# record names the commit that holds it. Run a paid journey or pair only when
# a human authorizes it; Distribution/evaluation/comparison.md is the
# maintainer guide.
#
# --recover finds, in the history of the repository holding RECORD (else
# this checkout's), the commit that holds the exact case and harness bytes
# a pair record hashes, wherever those files have moved since; states what
# a rerun would meet now (its payloads in --payload-repo, default this
# checkout, and the codex on PATH); and prints the record unchanged. It
# never reruns. It exits 0 when that basis is recovered and the record is as
# it was added, else 1.
#
# Default mode is credential-free: the catalog. Substitute-host pairs through
# this command and the pair judge's rejected cases are
# Distribution/evaluation/tests/native-guidance-checks/native-comparison-pairs.sh, refusals and incomplete
# pairs Distribution/evaluation/tests/native-guidance-checks/native-comparison-incomplete.sh, refresh and
# recovery Distribution/evaluation/tests/native-guidance-checks/native-comparison-refresh.sh, and each case's own
# credential-free proof Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-<case>.sh.
# Early arm cleanup and interrupts are exercised by native-guidance-check-cleanup.sh
# in the same directory.
# shellcheck disable=SC1091,SC2034,SC2154,SC2249,SC2310,SC2312 # Sourced runner, pair and helper globals; journeys report their verdicts.
set -euo pipefail
if ((BASH_VERSINFO[0] < 5)); then
  printf 'error: Bash 5 or later runs native comparisons (this is %s); put it first on PATH\n' "${BASH_VERSION}" >&2
  exit 2
fi

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
source "${source_dir}/Distribution/evaluation/src/native-comparison-pair.sh"
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-catalog.sh"
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-preflight.sh"
source "${source_dir}/Distribution/evaluation/src/native-comparison-baseline.sh"

# Prints the Usage block of this header.
usage() {
  awk '/^# Usage:$/ { on = 1 } on && /^#$/ { exit } on { sub(/^# ?/, ""); print }' \
    "${BASH_SOURCE[0]}" >&2
  exit 2
}

source "${source_dir}/Distribution/evaluation/src/native-guidance-check-options.sh"

if [[ -n ${reuse_baseline} || ${fresh_pair} == true || ${require_usage} == true ]]; then
  [[ -n ${host}${native_comparison_pair_candidate} && -n ${native_comparison_pair_candidate} ]] || usage
fi

if [[ -n ${export_baseline}${assess_baseline} ]]; then
  [[ -z ${host}${case_name}${results_dir}${pair_options}${recover} && ${list} == false && ${#where[@]} -eq 0 ]] || usage
  [[ ${baseline_arm} =~ ^(baseline|candidate)$ ]] || usage
  work=$(mktemp -d)
  trap 'rm -rf -- "${work}"' EXIT
  if [[ -n ${export_baseline} ]]; then
    [[ -n ${save_baseline} && -z ${assess_baseline} ]] || usage
    native_comparison_baseline_export "${export_baseline}" "${save_baseline}"
  else
    [[ -z ${save_baseline} ]] || usage
    native_comparison_baseline_assess "${assess_baseline}"
  fi
  exit
fi
frozen_baseline=false
if [[ -n ${native_comparison_pair_baseline} && -z ${native_comparison_pair_candidate}${native_comparison_pair_factor}${native_comparison_pair_gain}${native_comparison_pair_quality} ]]; then
  [[ -n ${save_baseline} ]] || usage
  frozen_baseline=true
fi

if [[ -n ${recover} ]]; then
  [[ -z ${host}${case_name}${results_dir}${pair_options}${save_baseline} && ${list} == false && -f ${recover} ]] || usage
  source "${source_dir}/Distribution/evaluation/src/native-comparison-basis-verdict.sh"
  work=$(mktemp -d)
  trap 'rm -rf -- "${work}"' EXIT
  repository=$(git -C "$(dirname -- "${recover}")" rev-parse --show-toplevel 2> /dev/null) || repository=${source_dir}
  native_comparison_basis_observe "${recover}" "${repository}" "${native_comparison_pair_repository}" \
    | tee "${work}/recovery.txt"
  native_comparison_recovery_judge "${work}/recovery.txt"
  printf 'recovery: %s\nrecovery-reason: %s\n' "${native_comparison_recovery_status}" "${native_comparison_recovery_reason}"
  native_comparison_recovery_rerun "${work}/recovery.txt"
  printf 'report: %s, as retained; recovery never reruns or rewrites it\n' "${recover}"
  cat -- "${recover}"
  [[ ${native_comparison_recovery_status} == pass ]]
  exit
fi
if [[ ${list} == true ]]; then
  [[ -z ${host}${case_name}${results_dir}${pair_options}${save_baseline} ]] || usage
  native_guidance_check_catalog "${source_dir}" "${where[@]}"
  exit
fi
if [[ -n ${host} ]]; then
  [[ -n ${case_name} && ${deadline} =~ ^[1-9][0-9]*$ && ${#where[@]} -eq 0 ]] || usage
  [[ -z ${save_baseline} || -n ${native_comparison_pair_baseline} ]] || usage
  pair=()
  if [[ -n ${pair_options} && ${frozen_baseline} == false ]]; then
    [[ -n ${native_comparison_pair_baseline} && -n ${native_comparison_pair_candidate} &&
      -n ${native_comparison_pair_factor} && -n ${native_comparison_pair_gain} &&
      -n ${native_comparison_pair_quality} && ${native_comparison_pair_arms} =~ ^(concurrent|sequential)$ ]] || usage
    pair=("${native_comparison_pair_repository}" "${native_comparison_pair_baseline}"
      "${native_comparison_pair_candidate}")
  elif [[ ${frozen_baseline} == true ]]; then
    pair=("${native_comparison_pair_repository}" "${native_comparison_pair_baseline}" "${native_comparison_pair_baseline}")
  fi
  [[ -z ${save_baseline} || ! -e ${save_baseline} ]] || {
    echo 'error: refusing to overwrite an existing baseline observation' >&2
    exit 2
  }
  [[ -z ${save_baseline} ]] || mkdir -p -- "$(dirname -- "${save_baseline}")"
  # Under TMPDIR, which a plain `mktemp -d` ignores on macOS: arms live here,
  # under a name that does not point the agent at this harness.
  work=$(mktemp -d "${TMPDIR:-/tmp}/tmp.XXXXXXXXXX")
  trap 'rm -rf -- "${work}"' EXIT
  native_guidance_check_preflight "${host}" "${case_name}" "${source_dir}" "${work}" "${pair[@]}" || exit 2
  results_dir=${results_dir:-$(mktemp -d)}
  native_result_require_writable "${results_dir}"
  trap 'native_guidance_check_interrupt 130' INT
  trap 'native_guidance_check_interrupt 143' TERM
  native_case_deadline=${deadline}
  native_codex_settings=(-m "${model}" -c "model_reasoning_effort=\"${effort}\"")
  status=0
  if [[ -z ${pair_options} || ${frozen_baseline} == true ]]; then
    journey=native_guidance_check_run_case
    [[ ${frozen_baseline} == false ]] || journey=native_comparison_baseline_capture
    "${journey}" "${case_name}" "${source_dir}" "${work}" \
      "${native_case_results_dir}" || status=$?
    [[ -f ${work}/observations.txt ]] || exit "${status}"
    cat -- "${work}/observations.txt"
    printf 'result-path: %s\n' "${native_guidance_check_attempt:-none retained}"
    [[ -z ${save_baseline} || -z ${native_guidance_check_attempt} ]] || native_comparison_baseline_export "${native_guidance_check_attempt}" "${save_baseline}"
    exit "${status}"
  fi
  native_comparison_pair "${case_name}" "${source_dir}" "${work}" "${native_case_results_dir}" || exit 2
  cat -- "${native_comparison_pair_attempt}/record"
  printf 'result-path: %s\n' "${native_comparison_pair_attempt}"
  if [[ -n ${save_baseline} ]]; then
    if [[ ${native_comparison_baseline_reused} == true && ${baseline_arm} == baseline ]]; then
      node -e 'const f=require("node:fs");f.copyFileSync(process.argv[1],process.argv[2],f.constants.COPYFILE_EXCL)' "${reuse_baseline}" "${save_baseline}"
      printf 'saved-baseline: %s\n' "${save_baseline}"
    else
      native_comparison_baseline_export "${native_comparison_pair_attempt}" "${save_baseline}"
    fi
  fi
  case ${native_comparison_verdict_outcome} in
    incomplete | not-comparable) exit 1 ;;
    *) exit 0 ;;
  esac
fi
[[ -z ${case_name}${results_dir}${pair_options}${save_baseline} && ${#where[@]} -eq 0 ]] || usage

exec "${BASH}" "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/native-guidance-check.sh"

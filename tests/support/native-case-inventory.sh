#!/usr/bin/env bash
# shellcheck disable=SC2154 # Wrapper/parser globals are assigned in native-cases.sh.
# Fixed native-check inventory and listing for the ADR-awareness wrappers.
# Sourced by native-cases.sh after usage/fail helpers exist.
# Listing is read-only: it never runs an agent or probes a version.
# Prior-evidence paths are unreviewed references, not certified reuse.

native_case_hosts=(codex cursor claude)
native_case_context_ids=(context/clear context/conflict)
native_case_delivery_ids=(
  delivery/legacy-refusal
  delivery/ordinary-update
  delivery/updated-use
)

native_case_id_in() {
  local needle=$1
  local candidate
  shift
  for candidate in "$@"; do
    if [[ ${candidate} == "${needle}" ]]; then
      return 0
    fi
  done
  return 1
}

native_case_known_host() {
  native_case_id_in "$1" "${native_case_hosts[@]}"
}

native_case_known_context_id() {
  native_case_id_in "$1" "${native_case_context_ids[@]}"
}

native_case_known_delivery_id() {
  native_case_id_in "$1" "${native_case_delivery_ids[@]}"
}

native_case_print_description() {
  local host=$1
  local case_id=$2

  printf 'purpose: '
  case ${case_id} in
    context/clear)
      printf 'Assess ADRs on a fresh install when index and record statuses agree.\n'
      printf 'setup: Current tagged two-skill public payload installed into a clean %s adopter target.\n' \
        "${host}"
      printf 'dependencies: none\n'
      ;;
    context/conflict)
      printf 'Assess ADRs on a fresh install when index and record statuses disagree, and stop for human resolution.\n'
      printf 'setup: Same clean %s install as context/clear, with the ADR index edited so its status disagrees with the record.\n' \
        "${host}"
      printf 'dependencies: none\n'
      ;;
    delivery/legacy-refusal)
      printf 'Refuse an incompatible smaller candidate against a genuine v0.2.0 three-file install without changing files.\n'
      printf 'setup: Genuine v0.2.0 three-file %s payload and a two-skill candidate with a smaller installed-payload contract.\n' \
        "${host}"
      printf 'dependencies: none\n'
      ;;
    delivery/ordinary-update)
      printf 'Perform an ordinary newer-release update of an inspected-bootstrap install.\n'
      printf 'setup: Inspected bootstrap of the current two-skill updater plus a newer local tagged fixture on %s.\n' \
        "${host}"
      printf 'dependencies: inspected bootstrap and newer local tagged fixture; not a native legacy-refusal result\n'
      ;;
    delivery/updated-use)
      printf 'Use installed ADR awareness in a fresh session on the updated installation.\n'
      printf 'setup: Fresh native session on the same isolated %s target after the verified native ordinary update.\n' \
        "${host}"
      printf 'dependencies: verified native delivery/ordinary-update in the same isolated target (record that update'\''s attempt ID); do not reconstruct from final bytes\n'
      ;;
    *)
      native_case_fail "unknown case '${case_id}'"
      ;;
  esac
}

native_case_print_prior_evidence() {
  local host=$1
  local case_id=$2
  local results_dir=${native_case_results_dir}
  local case_dir attempt printed

  if [[ -z ${results_dir} ]]; then
    printf 'prior-evidence: none\n'
    return
  fi
  if [[ ! -d "${results_dir}" ]]; then
    printf 'prior-evidence: none\n'
    return
  fi

  case_dir="${results_dir}/${host}/${case_id}"
  printed=0
  if [[ -d "${case_dir}" ]]; then
    for attempt in "${case_dir}"/*; do
      if [[ -e "${attempt}" ]]; then
        printf 'prior-evidence: unreviewed %s\n' "${attempt}"
        printed=1
      fi
    done
  fi
  if [[ ${printed} -eq 0 ]]; then
    printf 'prior-evidence: none\n'
  fi
}

native_case_print_record() {
  local host=$1
  local case_id=$2

  printf 'host: %s\n' "${host}"
  printf 'case: %s\n' "${case_id}"
  native_case_print_description "${host}" "${case_id}"
  native_case_print_prior_evidence "${host}" "${case_id}"
  printf '\n'
}

native_case_print_listing() {
  local host case_id

  native_case_print_usage
  printf '\n'
  case ${native_case_wrapper} in
    context)
      for host in "${native_case_hosts[@]}"; do
        for case_id in "${native_case_context_ids[@]}"; do
          native_case_print_record "${host}" "${case_id}"
        done
      done
      ;;
    delivery)
      for case_id in "${native_case_delivery_ids[@]}"; do
        native_case_print_record "${native_case_host}" "${case_id}"
      done
      ;;
    *)
      native_case_fail "internal error: unknown wrapper ${native_case_wrapper}"
      ;;
  esac
}

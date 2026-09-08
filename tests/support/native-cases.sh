#!/usr/bin/env bash
# shellcheck disable=SC2034 # Wrappers consume parsed native_case_* globals.
# Option parsing for the ADR-awareness native-check wrappers.
# Listing is read-only: it never runs an agent or probes a version.

native_case_entry=
native_case_wrapper=
native_case_fixed_host=
native_case_mode=
native_case_host=
native_case_id=
native_case_results_dir=
native_case_deadline=
native_case_grace=

native_case_print_usage() {
  printf 'usage: %s\n' "${native_case_entry}"
  printf '   or: %s --list [--results-dir DIR]\n' "${native_case_entry}"
  case ${native_case_wrapper} in
    context)
      printf '   or: %s --native HOST SCENARIO [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]\n' \
        "${native_case_entry}"
      printf '   or: %s --native HOST --case context/clear|context/conflict [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]\n' \
        "${native_case_entry}"
      printf 'HOST is codex, cursor, or claude. SCENARIO is clear or conflict.\n'
      printf 'Default --deadline is 3600 seconds; default --grace is 15 seconds.\n'
      ;;
    delivery)
      printf '   or: %s --native\n' "${native_case_entry}"
      printf '   or: %s --native --case CASE [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]\n' \
        "${native_case_entry}"
      printf 'CASE is delivery/legacy-refusal, delivery/ordinary-update, or delivery/updated-use.\n'
      printf '%s\n' \
        'delivery/legacy-refusal and delivery/ordinary-update are recognized and unavailable for selected launch.'
      printf '%s\n' \
        'delivery/updated-use is the combined ordinary no-URL update then fresh use journey in one attempt.'
      printf 'Selected --case does not launch the full three-session --native journey.\n'
      ;;
    *)
      printf 'error: internal error: unknown wrapper %s\n' \
        "${native_case_wrapper}" >&2
      ;;
  esac
  printf 'Listing is read-only and does not run an agent or probe its version.\n'
  printf '%s\n' \
    '--results-dir is optional for listing and need not be writable or exist.'
  printf '%s\n' \
    'Selected native launch with --results-dir requires a writable directory; without it the native path still uses disposable scratch.'
  printf '%s\n' \
    '--deadline and --grace apply to selected native launch. --deadline is an integer >= 1; --grace is an integer >= 0.'
}

native_case_fail() {
  printf 'error: %s\n' "$1" >&2
  native_case_print_usage >&2
  exit 2
}

native_case_reject_unavailable_selected() {
  native_case_fail "selected case '${native_case_id}' is recognized and unavailable for selected launch"
}

native_case_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-case-inventory.sh
# shellcheck disable=SC1091
source "${native_case_support_dir}/native-case-inventory.sh"
# shellcheck source=tests/support/native-case-parse.sh
# shellcheck disable=SC1091
source "${native_case_support_dir}/native-case-parse.sh"

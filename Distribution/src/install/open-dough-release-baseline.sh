#!/usr/bin/env bash
# Ordinary-update proof that every installed root still holds its recorded
# release, and the refusal outcome when that proof is unavailable.
# Sourced by open-dough-release.sh after platform, version, and resolve modules.
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2312

report_unverifiable_installation() {
  local dest=$1
  local outcome=${2:-'refused; preserved the selected installation.'}

  trace_line "apply-unverifiable ${dest}"
  printf 'Outcome: %s\n' "${outcome}"
}

refuse_if_ordinary_unverifiable() {
  local dest=$1
  local supplied_url=$2

  if [[ "${supplied_url}" -eq 0 ]]; then
    report_unverifiable_installation "${dest}"
  fi
}

# baseline is a clean tagged tree of the release recorded as installed.
recorded_baseline_unchanged() {
  local dest=$1
  local baseline=$2
  local installed=$3

  if ! managed_payload_unchanged "${dest}" "${baseline}"; then
    echo "Installed files do not match recorded release ${installed}; ordinary update requires an unchanged installation." >&2
    return 1
  fi
}

# fetched_version and fetched_checkout name a clean tagged tree already fetched
# from url in this run, if any. Each other recorded release is fetched once,
# and roots recording a fetched release compare against it.
all_roots_verified_for_release() {
  local target=$1 url=$2 work_root=$3 latest_version=$4
  local fetched_version=${5:-} fetched_checkout=${6:-}
  local current_platform current_dest installed relation baseline

  while IFS=$'\t' read -r current_platform current_dest; do
    if [[ ! -d "${current_dest}" ]]; then
      continue
    fi
    if [[ $(read_source_record "${current_dest}/SOURCE" 2> /dev/null || true) != "${url}" ]]; then
      echo "${current_platform}: SOURCE conflicts with the shared installation; ordinary update refuses without writes." >&2
      return 1
    fi
    installed=$(read_record "${current_dest}/VERSION") || {
      echo "${current_platform}: missing or malformed VERSION; ordinary all-tool update refuses without writes." >&2
      return 1
    }
    if [[ -z "${installed}" ]]; then
      echo "Missing installed version record: ${current_dest}/VERSION" >&2
      echo "${current_platform}: missing or malformed VERSION; ordinary all-tool update refuses without writes." >&2
      return 1
    fi
    if [[ -z "${fetched_checkout}" || "${installed}" != "${fetched_version}" ]]; then
      baseline="${work_root}/baseline-${current_platform}"
      fetch_tagged_release "${url}" "${baseline}" "${installed}" > /dev/null || return 1
      fetched_version=${installed}
      fetched_checkout=${baseline}
    fi
    recorded_baseline_unchanged "${current_dest}" "${fetched_checkout}" "${installed}" || return 1
    relation=$(compare_versions "${installed}" "${latest_version}")
    if [[ "${relation}" == newer ]]; then
      echo "${current_platform}: installed ${installed} is newer than source ${latest_version}; ordinary all-tool update refuses without a downgrade." >&2
      return 1
    fi
  done < <(all_destinations_for "${target}")
}

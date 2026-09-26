#!/usr/bin/env bash
# shellcheck disable=SC2154,SC2310,SC2312
# Copy the caller's managed_files declaration into each native destination.
# Sourced by install.sh after platform and host-hook helpers. The declaration
# stays in install.sh: historical checkouts are read from that literal array.
# Caller assigns managed_files, source_dir, target, recorded_source, force,
# replace_verified, and version.

# Run match, copy, or copy-then-match for the declared files in one Node
# process. match exits 1 on a difference. copy exits 1 when a file cannot be
# written, after earlier files in the declaration order have already been
# replaced. copy-then-match copies, then verifies the written bytes, exiting 3
# on a difference and 4 when verification cannot read a file. Without Node,
# fall back to cp and cmp so a hook-less install still works.
payload_bytes_run() {
  local mode=$1
  local root=$2
  local helper="${source_dir}/src/install/open-dough-payload-bytes.mjs"
  local managed_file
  if [[ -f ${helper} ]] && command -v node > /dev/null 2>&1; then
    printf '%s\n' "${managed_files[@]}" | node "${helper}" "${mode}" \
      "${source_dir}/src/skills" "${root}"
    return
  fi
  if [[ ${mode} != match ]]; then
    for managed_file in "${managed_files[@]}"; do
      cp -- "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || return 1
    done
    [[ ${mode} == copy-then-match ]] || return 0
  fi
  for managed_file in "${managed_files[@]}"; do
    cmp -s "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || {
      [[ ${mode} == match ]] && return 1
      return 3
    }
  done
}

payload_bytes_match() {
  payload_bytes_run match "$1"
}

create_payload_directories() {
  local root=$1
  local managed_file directory
  local -a directories=()
  local seen=$'\n'
  for managed_file in "${managed_files[@]}"; do
    directory=${managed_file%/*}
    [[ ${seen} == *$'\n'${directory}$'\n'* ]] && continue
    seen+=${directory}$'\n'
    directories+=("${root}/${directory}")
  done
  mkdir -p -- "${directories[@]}"
}

install_declared_payload() {
  if host_hook_fragments_present "${source_dir}"; then
    preflight_host_hook_destinations "${source_dir}" "${target}" || exit 1
  fi

  platforms=() destinations=() roots=() actions=()
  while IFS=$'\t' read -r selected_platform destination; do
    root=$(dirname -- "${destination}")
    platforms+=("${selected_platform}")
    destinations+=("${destination}")
    roots+=("${root}")
    assert_safe_destination_root "${selected_platform}" "${root}" || exit 1
    existing=0
    for managed_file in "${managed_files[@]}"; do
      ! destination_has_managed_skill "${root}" "${managed_file}" || existing=1
      assert_no_managed_collision "${root}" "${managed_file}" || exit 1
    done
    current=0
    # Byte comparison cannot flip a missing or different record back to current,
    # and force ignores currency, so those installs skip the per-file compares.
    if [[ ${force} -eq 0 && -f "${destination}/SOURCE" && -f "${destination}/VERSION" ]] \
      && [[ $(cat "${destination}/SOURCE") == "${recorded_source}" && $(cat "${destination}/VERSION") == "${version}" ]]; then
      current=1
      status=0
      payload_bytes_match "${root}" || status=$?
      if [[ ${status} -ne 0 ]]; then
        [[ ${status} -eq 1 ]] || exit "${status}"
        current=0
      fi
    fi
    if [[ ${force} -eq 1 ]]; then
      actions+=(replace)
    elif [[ ${replace_verified} -eq 1 && ${current} -eq 1 ]]; then
      actions+=(skip)
    elif [[ ${replace_verified} -eq 1 ]]; then
      actions+=(replace)
    elif [[ ${existing} -eq 0 ]]; then
      actions+=(install)
    elif [[ ${current} -eq 1 ]]; then
      actions+=(skip)
    else
      echo "${selected_platform}: existing managed installation is edited, partial, or unverifiable. Use --force to explicitly reinstall." >&2
      exit 1
    fi
  done < <(all_destinations_for "${target}")

  needs_payload_writes=0
  for action in "${actions[@]}"; do [[ "${action}" == skip ]] || needs_payload_writes=1; done
  if host_hook_fragments_present "${source_dir}"; then
    preflight_host_hooks "${source_dir}" "${target}" || exit 1
  fi

  for index in "${!platforms[@]}"; do
    [[ ${actions[index]} == skip ]] && {
      echo "${platforms[index]}: already current; left unwritten."
      continue
    }
    destination=${destinations[index]}
    root=${roots[index]}
    [[ -z "${OPEN_DOUGH_TRACE:-}" ]] || printf 'install %s\n' "${destination}" >> "${OPEN_DOUGH_TRACE}"
    create_payload_directories "${root}"
    [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" != copy ]] || {
      printf '%s\n' partial-install > "${destination}/SKILL.md"
      report_incomplete_install "${platforms[index]}" 'Copy failed after replacement started.'
    }
    # One process copies, then verifies the written bytes.
    verification_failed=0
    status=0
    payload_bytes_run copy-then-match "${root}" || status=$?
    case ${status} in
      0) ;;
      3) verification_failed=1 ;;
      4) exit 2 ;;
      *) report_incomplete_install "${platforms[index]}" 'Copy failed after replacement started.' ;;
    esac
    [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" != verify && ${verification_failed} -eq 0 ]] || report_incomplete_install "${platforms[index]}" 'Installed payload verification failed.'
    write_certified_records "${destination}" "${recorded_source}" "${version}" || report_incomplete_install "${platforms[index]}" 'Failed to write installation records after replacement started.'
    echo "${platforms[index]}: installed Open Dough guidance in ${root} (version ${version})."
  done

  if host_hook_fragments_present "${source_dir}"; then
    apply_host_hooks "${source_dir}" "${target}" || {
      if [[ ${needs_payload_writes} -eq 1 ]]; then
        echo "Hook registration failed after managed payload writes. Installed files may be incomplete. Recover with an explicit --force reinstall." >&2
      fi
      exit 1
    }
  fi
}

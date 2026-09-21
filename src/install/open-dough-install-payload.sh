#!/usr/bin/env bash
# shellcheck disable=SC2154,SC2310,SC2312
# Copy the caller's managed_files declaration into each native destination.
# Sourced by install.sh after platform and host-hook helpers. The declaration
# stays in install.sh: historical checkouts are read from that literal array.
# Caller assigns managed_files, source_dir, target, recorded_source, force,
# replace_verified, and version.

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
    if [[ -f "${destination}/SOURCE" && -f "${destination}/VERSION" ]] \
      && [[ $(cat "${destination}/SOURCE") == "${recorded_source}" && $(cat "${destination}/VERSION") == "${version}" ]]; then current=1; fi
    for managed_file in "${managed_files[@]}"; do
      cmp -s "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || current=0
    done
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
    for managed_file in "${managed_files[@]}"; do
      mkdir -p -- "${root}/${managed_file%/*}"
    done
    [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" != copy ]] || {
      printf '%s\n' partial-install > "${destination}/SKILL.md"
      report_incomplete_install "${platforms[index]}" 'Copy failed after replacement started.'
    }
    for managed_file in "${managed_files[@]}"; do cp -- "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || report_incomplete_install "${platforms[index]}" 'Copy failed after replacement started.'; done
    verification_failed=0
    for managed_file in "${managed_files[@]}"; do cmp -s "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || verification_failed=1; done
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

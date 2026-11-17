#!/usr/bin/env bash
# The participant environment of the launch-command-tests case (case.md,
# Participant environment): case_materialize exports it before any session
# starts, so every turn, a resumed turn and the observer inherit it, and
# case_cleanup removes it. Inside the native write sandbox the setuid
# /bin/ps is denied (EPERM), which broke the owning backend specs' teardown,
# and the arm's own temporary directory is too long for the private GitHub
# owner's socket, which broke the E2E consumer's startup.
# shellcheck disable=SC2034,SC2312 # case_environment_* globals are kept for cleanup; the platform check reads what uname gives.

case_environment_alias=
case_environment_dir=

# Exports, for arm ROOT, PATH starting with a private, non-setuid, ad-hoc
# signed copy of the real ps (macOS) and TMPDIR as a short /tmp alias of
# ROOT/environment/tmp, whose children stay real directories inside the
# writable arm. A failed step removes what it made and exports nothing.
case_environment_prepare() {
  case_environment_dir="$1/environment"
  if ! {
    case_environment_alias=$(mktemp -d /tmp/lct.XXXXXX) \
      && mkdir -p -- "${case_environment_dir}/bin" "${case_environment_dir}/tmp" \
      && ln -s -- "${case_environment_dir}/tmp" "${case_environment_alias}/t" \
      && case_environment_process_tool "${case_environment_dir}/bin"
  }; then
    case_environment_remove
    return 1
  fi
  case_environment_saved_path=${PATH}
  case_environment_saved_tmpdir=${TMPDIR-}
  export PATH="${case_environment_dir}/bin:${PATH}" TMPDIR="${case_environment_alias}/t"
}

# Copies the real process-listing tool into BIN where the sandbox denies the
# setuid original; elsewhere the original stays.
case_environment_process_tool() {
  [[ $(uname -s) == Darwin ]] || return 0
  cp /bin/ps "$1/ps" && chmod 755 "$1/ps" && codesign --force --sign - "$1/ps" 2> /dev/null
}

case_environment_remove() {
  [[ -z ${case_environment_alias} ]] || rm -rf -- "${case_environment_alias}"
  [[ -z ${case_environment_dir} ]] || rm -rf -- "${case_environment_dir}"
  case_environment_alias=
  case_environment_dir=
}

# Restores the exported environment and removes the alias, the generated
# tool and the arm's temporary files; prints no observation field.
case_cleanup() {
  if [[ -n ${case_environment_dir} ]]; then
    PATH=${case_environment_saved_path}
    if [[ -n ${case_environment_saved_tmpdir} ]]; then
      export TMPDIR=${case_environment_saved_tmpdir}
    else
      unset TMPDIR
    fi
  fi
  case_environment_remove
}

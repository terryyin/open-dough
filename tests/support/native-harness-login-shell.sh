#!/usr/bin/env bash
# Keeps a native fixture's harness bin first on PATH inside the agent's own
# shell. Codex runs each command through `zsh -lc` and Cursor snapshots a
# `zsh -ilc` shell; both read the user's startup files, which may rebuild PATH
# without the harness bin, so `gh`, and any observer the agent starts, would
# reach the real GitHub CLI instead of the fixture's shim. Pointing ZDOTDIR at
# harness startup files that run the user's own and then put the bin back
# first keeps the shims reachable. Bash startup files have no such redirect.

# Writes zsh startup files into harness directory $1 that each run the user's
# file of the same name and then prepend $1/bin to PATH, and exports ZDOTDIR
# to them. native_harness_release_login_path restores ZDOTDIR.
native_harness_keep_login_path() {
  local harness=$1 user_dir=${ZDOTDIR:-${HOME}} file user_q bin_q
  native_harness_old_zdotdir=${ZDOTDIR-}
  native_harness_had_zdotdir=${ZDOTDIR+set}
  mkdir -p "${harness}/zdotdir"
  printf -v bin_q '%q' "${harness}/bin"
  for file in .zshenv .zprofile .zshrc .zlogin; do
    printf -v user_q '%q' "${user_dir}/${file}"
    printf '%s\n' \
      "if [ -f ${user_q} ]; then . ${user_q}; fi" \
      "PATH=${bin_q}:\${PATH}" \
      'export PATH' > "${harness}/zdotdir/${file}"
  done
  export ZDOTDIR="${harness}/zdotdir"
}

native_harness_release_login_path() {
  if [[ ${native_harness_had_zdotdir} == set ]]; then
    export ZDOTDIR=${native_harness_old_zdotdir}
  else
    unset ZDOTDIR
  fi
}

# Writes into directory $1 a user profile whose zsh startup files each put
# $1/decoy first on PATH, where each command named in $2...
# appends its arguments to $1/decoy.log and fails, as a user's own profile
# could put another gh before the shim.
native_harness_write_decoy_profile() {
  local profile=$1 name
  shift
  mkdir -p "${profile}/decoy"
  for name in "$@"; do
    printf '%s\n' '#!/usr/bin/env bash' \
      "printf '%s\\n' \"\$*\" >> '${profile}/decoy.log'" 'exit 1' \
      > "${profile}/decoy/${name}"
    chmod +x "${profile}/decoy/${name}"
  done
  printf 'export PATH=%q\n' "${profile}/decoy:${PATH}" \
    | tee "${profile}/.zshenv" "${profile}/.zprofile" > "${profile}/.zshrc"
}

# Writes into directory $1 a user profile whose every zsh startup file, the
# last one included, rebuilds PATH from system directories alone.
native_harness_write_rebuilt_profile() {
  mkdir -p "$1"
  printf '%s\n' 'export PATH=/usr/bin:/bin:/usr/sbin:/sbin' \
    | tee "$1/.zshenv" "$1/.zprofile" "$1/.zshrc" > "$1/.zlogin"
}

# Runs command $1 as an interactive login zsh (Cursor's shell) would: each
# startup file from ZDOTDIR, else HOME, in zsh's order. Emulated in bash so
# the check needs no zsh.
native_harness_login_shell() {
  local dir=${ZDOTDIR:-${HOME}}
  bash -c 'for file in .zshenv .zprofile .zshrc .zlogin; do
      if [ -f "$1/${file}" ]; then . "$1/${file}"; fi
    done
    eval "$2"' _ "${dir}" "$1"
}

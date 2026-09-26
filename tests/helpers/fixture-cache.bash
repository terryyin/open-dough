#!/usr/bin/env bash
# Reuse of expensive fixture builds across one check's wrapper runs.
#
# fixture_cache_fill NAME ROOT BUILDER [ARGS...] fills ROOT with the fixture
# `BUILDER ROOT [ARGS...]` builds, and sets fixture_cache_built to where that
# build lives. A check that runs one fixture-building wrapper several times may
# export OPEN_DOUGH_TEST_FIXTURE_CACHE, a directory it owns and removes; each
# NAME is then built once there and every run gets its own copy. Without it,
# BUILDER builds straight into ROOT.
#
# A builder writes only under its root; it may embed in text files that root's
# path or the fixture_cache_built of an earlier fill in this process, which a
# copy rewrites, logical and physical, to where this process filled them. Each
# build lives at <cache>/<NAME>/fixture, so no build path is a substring of
# another and any NAME is safe. A run thus sees exactly what fresh builds at its
# own paths would hold.

# shellcheck disable=SC2034 # Callers read fixture_cache_built after a fill.
fixture_cache_built=
fixture_cache_physical_moves=()
fixture_cache_logical_moves=()

fixture_cache_fill() {
  local name=$1
  local root=$2
  local builder=$3
  local cache=${OPEN_DOUGH_TEST_FIXTURE_CACHE:-}
  local built ready cache_physical built_logical built_physical root_physical
  local files file contents move
  shift 3

  mkdir -p -- "${root}"
  if [[ -z ${cache} ]]; then
    "${builder}" "${root}" "$@"
    fixture_cache_built=${root}
    return
  fi
  built="${cache}/${name}/fixture"
  ready="${cache}/${name}/ready"
  if [[ ! -e ${ready} ]]; then
    rm -rf -- "${cache:?}/${name}"
    mkdir -p -- "${built}"
    "${builder}" "${built}" "$@"
    built_physical=$(cd -- "${built}" && pwd -P)
    printf '%s\n' "${built}" "${built_physical}" > "${ready}"
  fi
  { read -r built_logical && read -r built_physical; } < "${ready}"
  # shellcheck disable=SC2034 # Callers read fixture_cache_built after a fill.
  fixture_cache_built=${built}
  cp -R -- "${built}/." "${root}/"
  root_physical=$(cd -- "${root}" && pwd -P)
  # A physical path can contain a logical one (/private/var/x holds /var/x),
  # so physical paths move first.
  fixture_cache_physical_moves+=("${built_physical}"$'\t'"${root_physical}")
  fixture_cache_logical_moves+=("${built_logical}"$'\t'"${root}")
  cache_physical=$(cd -- "${cache}" && pwd -P)
  files=$(grep -rlF -e "${cache}/" -e "${cache_physical}/" -- "${root}") \
    || [[ $? -eq 1 ]]
  [[ -n ${files} ]] || return 0
  while IFS= read -r file; do
    IFS= read -r -d '' contents < "${file}" || true
    for move in "${fixture_cache_physical_moves[@]}" "${fixture_cache_logical_moves[@]}"; do
      contents=${contents//"${move%%$'\t'*}"/"${move#*$'\t'}"}
    done
    printf '%s' "${contents}" > "${file}"
  done <<< "${files}"
}

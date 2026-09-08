#!/usr/bin/env bash
# Latest-tag resolution, fetch, pin, and pinned-checkout verification.
# Sourced by open-dough-release.sh.
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2249

git_url() {
  local url=$1

  if [[ -d "${url}" ]]; then
    printf 'file://%s\n' "${url}"
  else
    printf '%s\n' "${url}"
  fi
}

upsert_tag_commit() {
  local version=$1
  local sha=$2
  local filtered=''
  local line

  while IFS= read -r line || [[ -n "${line}" ]]; do
    [[ -z "${line}" ]] && continue
    case "${line}" in
      "${version} "*)
        continue
        ;;
    esac
    filtered="${filtered}${line}"$'\n'
  done << EOF
${tag_commits}
EOF
  tag_commits="${filtered}${version} ${sha}"$'\n'
}

resolve_url() {
  local url=$1
  local listing
  local sha ref version
  local best='' best_sha=''
  local relation
  local line

  tag_commits=''
  if ! listing=$(git ls-remote --tags -- "${url}" 2> /dev/null); then
    echo "Failed to fetch tags from ${url}" >&2
    return 1
  fi

  while IFS=$'\t' read -r sha ref; do
    [[ -n "${sha}" && -n "${ref}" ]] || continue
    case "${ref}" in
      refs/tags/v*)
        version=${ref#refs/tags/v}
        version=${version%'^{}'}
        if is_release_version "${version}"; then
          upsert_tag_commit "${version}" "${sha}"
        fi
        ;;
    esac
  done << EOF
${listing}
EOF

  while IFS= read -r line || [[ -n "${line}" ]]; do
    [[ -z "${line}" ]] && continue
    version="${line%% *}"
    sha="${line#* }"
    if [[ -z "${best}" ]]; then
      best="${version}"
      best_sha="${sha}"
      continue
    fi
    relation=$(compare_versions "${best}" "${version}")
    if [[ "${relation}" == older ]]; then
      best="${version}"
      best_sha="${sha}"
    fi
  done << EOF
${tag_commits}
EOF

  if [[ -z "${best}" ]]; then
    echo "No numeric release tags in ${url}" >&2
    return 1
  fi
  printf 'v%s\t%s\t%s\n' "${best}" "${best_sha}" "${best}"
}

# Require checkout VERSION and changelog to match the resolved tag.
require_checkout_matches_tag() {
  local checkout=$1
  local tag=$2
  local version

  if ! version=$(validate_checkout "${checkout}"); then
    echo "Highest release ${tag} is invalid; not falling back to another release or branch." >&2
    return 1
  fi
  if [[ "${version}" != "${tag#v}" ]]; then
    echo "Highest release ${tag} is invalid; not falling back to another release or branch." >&2
    return 1
  fi
}

# Detach checkout at the resolved commit and require VERSION to match tag.
# When cleanup_path is set, remove it before returning a handled failure.
checkout_resolved_release() {
  local checkout=$1
  local url=$2
  local resolved=$3
  local head_label=$4
  local cleanup_path=${5-}
  local tag commit fetch_url head

  IFS=$'\t' read -r tag commit _ << EOF
${resolved}
EOF
  fetch_url=$(git_url "${url}")
  if ! git -C "${checkout}" fetch --quiet --depth 1 "${fetch_url}" "${commit}"; then
    [[ -n "${cleanup_path}" ]] && rm -rf -- "${cleanup_path}"
    echo "Failed to fetch ${tag} from ${url}" >&2
    return 1
  fi
  git -C "${checkout}" -c advice.detachedHead=false checkout --quiet --detach FETCH_HEAD
  head=$(git -C "${checkout}" rev-parse HEAD)
  if [[ "${head}" != "${commit}" ]]; then
    [[ -n "${cleanup_path}" ]] && rm -rf -- "${cleanup_path}"
    echo "${head_label} commit ${head} did not match resolved ${commit}" >&2
    return 1
  fi
  if ! require_checkout_matches_tag "${checkout}" "${tag}"; then
    [[ -n "${cleanup_path}" ]] && rm -rf -- "${cleanup_path}"
    return 1
  fi
}

# Resolve one recorded numeric tag from the source. Prefer a peeled commit.
resolve_tagged_release() {
  local url=$1
  local version=$2
  local listing sha ref found_sha='' peeled=0

  if ! is_release_version "${version}"; then
    echo "Malformed installed record: ${version}" >&2
    return 1
  fi
  if ! listing=$(git ls-remote --tags -- "${url}" 2> /dev/null); then
    echo "Failed to fetch tags from ${url}" >&2
    return 1
  fi

  while IFS=$'\t' read -r sha ref; do
    [[ -n "${sha}" && -n "${ref}" ]] || continue
    case "${ref}" in
      "refs/tags/v${version}^{}")
        found_sha=${sha}
        peeled=1
        ;;
      "refs/tags/v${version}")
        if [[ "${peeled}" -ne 1 ]]; then
          found_sha=${sha}
        fi
        ;;
    esac
  done << EOF
${listing}
EOF

  if [[ -z "${found_sha}" ]]; then
    echo "No numeric release tag v${version} in ${url}" >&2
    return 1
  fi
  printf 'v%s\t%s\t%s\n' "${version}" "${found_sha}" "${version}"
}

fetch_resolved_release() {
  local url=$1
  local dest=$2
  local resolved=$3

  if [[ -e "${dest}" ]]; then
    echo "Fetch destination already exists: ${dest}" >&2
    return 1
  fi
  mkdir -p -- "${dest}"
  git -C "${dest}" init --quiet
  checkout_resolved_release "${dest}" "${url}" "${resolved}" Fetched "${dest}"
  printf '%s\n' "${resolved}"
}

fetch_release() {
  local url=$1
  local dest=$2
  local resolved

  resolved=$(resolve_url "${url}") || return 1
  fetch_resolved_release "${url}" "${dest}" "${resolved}"
}

# Fetch a recorded tag as data. Callers must not execute that checkout.
fetch_tagged_release() {
  local url=$1
  local dest=$2
  local version=$3
  local resolved

  resolved=$(resolve_tagged_release "${url}" "${version}") || return 1
  fetch_resolved_release "${url}" "${dest}" "${resolved}"
}

pin_latest() {
  local checkout=$1
  local url=$2
  local resolved

  if [[ -z "${url}" ]]; then
    url=$(git -C "${checkout}" remote get-url origin)
  fi
  resolved=$(resolve_url "${url}")
  checkout_resolved_release "${checkout}" "${url}" "${resolved}" Pinned
  printf '%s\n' "${resolved}"
}

require_pinned_checkout() {
  local checkout=$1
  local url=$2
  local resolved tag commit head

  resolved=$(resolve_url "${url}")
  IFS=$'\t' read -r tag commit _ << EOF
${resolved}
EOF
  if ! head=$(git -C "${checkout}" rev-parse HEAD 2> /dev/null); then
    echo "Checkout is not a git work tree: ${checkout}" >&2
    return 1
  fi
  if [[ "${head}" != "${commit}" ]]; then
    echo "Checkout HEAD ${head} is not the pinned latest ${commit}; not replacing inspected files." >&2
    return 1
  fi
  require_checkout_matches_tag "${checkout}" "${tag}" || return 1
  printf '%s\n' "${resolved}"
}

#!/usr/bin/env bash
# Latest-tag resolution, fetch, and pin.
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

# Detach checkout at the resolved commit and require VERSION to match tag.
# When cleanup_path is set, remove it before returning a handled failure.
checkout_resolved_release() {
  local checkout=$1
  local url=$2
  local resolved=$3
  local head_label=$4
  local cleanup_path=${5-}
  local tag commit version fetch_url head

  IFS=$'\t' read -r tag commit version << EOF
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
  if ! version=$(validate_checkout "${checkout}"); then
    [[ -n "${cleanup_path}" ]] && rm -rf -- "${cleanup_path}"
    echo "Highest release ${tag} is invalid; not falling back to another release or branch." >&2
    return 1
  fi
  if [[ "${version}" != "${tag#v}" ]]; then
    [[ -n "${cleanup_path}" ]] && rm -rf -- "${cleanup_path}"
    echo "Highest release ${tag} is invalid; not falling back to another release or branch." >&2
    return 1
  fi
}

fetch_release() {
  local url=$1
  local dest=$2
  local resolved

  if [[ -e "${dest}" ]]; then
    echo "Fetch destination already exists: ${dest}" >&2
    return 1
  fi
  resolved=$(resolve_url "${url}")
  mkdir -p -- "${dest}"
  git -C "${dest}" init --quiet
  checkout_resolved_release "${dest}" "${url}" "${resolved}" Fetched "${dest}"
  printf '%s\n' "${resolved}"
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

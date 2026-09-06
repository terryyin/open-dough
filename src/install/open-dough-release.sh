#!/usr/bin/env bash
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2249
set -euo pipefail

usage() {
  echo "Usage: $0 <command> [args]" >&2
  echo "Commands: validate-checkout, source-version, read-record, compare," >&2
  echo "          destination, resolve-url, fetch-release, pin-latest, apply" >&2
  exit 1
}

is_release_version() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

read_version_file() {
  local file=$1
  local version='' extra=''

  if [[ ! -f "${file}" ]]; then
    echo "Missing version file: ${file}" >&2
    return 1
  fi
  {
    IFS= read -r version || true
    IFS= read -r extra || true
  } < "${file}"
  if [[ -n "${extra}" ]]; then
    echo "Malformed version file: ${file}" >&2
    return 1
  fi
  if ! is_release_version "${version}"; then
    echo "Malformed version: ${version}" >&2
    return 1
  fi
  printf '%s\n' "${version}"
}

changelog_has_dated_entry() {
  local checkout=$1
  local version=$2
  local changelog="${checkout}/CHANGELOG.md"

  if [[ ! -f "${changelog}" ]]; then
    echo "Missing changelog: ${changelog}" >&2
    return 1
  fi
  if ! grep -Eq "^## ${version} - [0-9]{4}-[0-9]{2}-[0-9]{2}$" "${changelog}"; then
    echo "Missing dated changelog entry for ${version}" >&2
    return 1
  fi
}

validate_checkout() {
  local checkout=$1
  local version

  version=$(read_version_file "${checkout}/VERSION")
  changelog_has_dated_entry "${checkout}" "${version}"
  printf '%s\n' "${version}"
}

read_record() {
  local file=$1
  local version='' extra=''

  if [[ ! -e "${file}" ]]; then
    return 0
  fi
  if [[ ! -f "${file}" ]]; then
    echo "Malformed installed record: ${file}" >&2
    return 2
  fi
  {
    IFS= read -r version || true
    IFS= read -r extra || true
  } < "${file}"
  if [[ -n "${extra}" ]] || ! is_release_version "${version}"; then
    echo "Malformed installed record: ${file}" >&2
    return 2
  fi
  printf '%s\n' "${version}"
}

compare_versions() {
  local first=$1
  local second=$2
  local first_major first_minor first_patch
  local second_major second_minor second_patch

  if [[ "${first}" == "${second}" ]]; then
    echo equal
    return 0
  fi
  IFS=. read -r first_major first_minor first_patch << EOF
${first}
EOF
  IFS=. read -r second_major second_minor second_patch << EOF
${second}
EOF
  if [[ "${first_major}" -lt "${second_major}" ]]; then
    echo older
    return 0
  fi
  if [[ "${first_major}" -gt "${second_major}" ]]; then
    echo newer
    return 0
  fi
  if [[ "${first_minor}" -lt "${second_minor}" ]]; then
    echo older
    return 0
  fi
  if [[ "${first_minor}" -gt "${second_minor}" ]]; then
    echo newer
    return 0
  fi
  if [[ "${first_patch}" -lt "${second_patch}" ]]; then
    echo older
    return 0
  fi
  echo newer
}

destination_for() {
  local target=$1
  local platform=$2

  case "${platform}" in
    codex)
      printf '%s\n' "${target}/.agents/skills/dough-update"
      ;;
    cursor)
      printf '%s\n' "${target}/.cursor/skills/dough-update"
      ;;
    claude)
      printf '%s\n' "${target}/.claude/skills/dough-update"
      ;;
    *)
      echo "Unsupported platform: ${platform}. Supported platforms: codex, cursor, claude." >&2
      return 1
      ;;
  esac
}

git_url() {
  local url=$1

  if [[ -d "${url}" ]]; then
    printf 'file://%s\n' "${url}"
  else
    printf '%s\n' "${url}"
  fi
}

refuse_requested_version() {
  echo "Open Dough installs and updates the latest numeric release only. Requested-version updates are not supported." >&2
  exit 1
}

looks_like_version_request() {
  local arg=$1

  [[ "${arg}" == --version || "${arg}" == --tag || "${arg}" == --release ]] && return 0
  [[ "${arg}" == v*.*.* ]] && return 0
  is_release_version "${arg}"
}

trace_line() {
  if [[ -n "${OPEN_DOUGH_TRACE:-}" ]]; then
    printf '%s\n' "$1" >> "${OPEN_DOUGH_TRACE}"
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

fetch_release() {
  local url=$1
  local dest=$2
  local resolved tag commit version head fetch_url

  if [[ -e "${dest}" ]]; then
    echo "Fetch destination already exists: ${dest}" >&2
    return 1
  fi
  resolved=$(resolve_url "${url}")
  IFS=$'\t' read -r tag commit version << EOF
${resolved}
EOF
  mkdir -p -- "${dest}"
  git -C "${dest}" init --quiet
  fetch_url=$(git_url "${url}")
  if ! git -C "${dest}" fetch --quiet --depth 1 "${fetch_url}" "${commit}"; then
    rm -rf -- "${dest}"
    echo "Failed to fetch ${tag} from ${url}" >&2
    return 1
  fi
  git -C "${dest}" -c advice.detachedHead=false checkout --quiet --detach FETCH_HEAD
  head=$(git -C "${dest}" rev-parse HEAD)
  if [[ "${head}" != "${commit}" ]]; then
    rm -rf -- "${dest}"
    echo "Fetched commit ${head} did not match resolved ${commit}" >&2
    return 1
  fi
  if ! version=$(validate_checkout "${dest}"); then
    rm -rf -- "${dest}"
    echo "Highest release ${tag} is invalid; not falling back to another release or branch." >&2
    return 1
  fi
  if [[ "${version}" != "${tag#v}" ]]; then
    rm -rf -- "${dest}"
    echo "Highest release ${tag} is invalid; not falling back to another release or branch." >&2
    return 1
  fi
  printf '%s\n' "${resolved}"
}

pin_latest() {
  local checkout=$1
  local url=$2
  local resolved tag commit version head fetch_url

  if [[ -z "${url}" ]]; then
    url=$(git -C "${checkout}" remote get-url origin)
  fi
  resolved=$(resolve_url "${url}")
  IFS=$'\t' read -r tag commit version << EOF
${resolved}
EOF
  fetch_url=$(git_url "${url}")
  if ! git -C "${checkout}" fetch --quiet --depth 1 "${fetch_url}" "${commit}"; then
    echo "Failed to fetch ${tag} from ${url}" >&2
    return 1
  fi
  git -C "${checkout}" -c advice.detachedHead=false checkout --quiet --detach FETCH_HEAD
  head=$(git -C "${checkout}" rev-parse HEAD)
  if [[ "${head}" != "${commit}" ]]; then
    echo "Pinned commit ${head} did not match resolved ${commit}" >&2
    return 1
  fi
  if ! version=$(validate_checkout "${checkout}"); then
    echo "Highest release ${tag} is invalid; not falling back to another release or branch." >&2
    return 1
  fi
  if [[ "${version}" != "${tag#v}" ]]; then
    echo "Highest release ${tag} is invalid; not falling back to another release or branch." >&2
    return 1
  fi
  printf '%s\n' "${resolved}"
}

run_installer() {
  local checkout=$1
  local target=$2
  local platform=$3
  local force=$4
  local -a args

  args=(--target "${target}" --platform "${platform}")
  if [[ "${force}" -eq 1 ]]; then
    args+=(--force)
  fi
  bash "${checkout}/install.sh" "${args[@]}"
}

apply_release() {
  local url=''
  local target=''
  local platform=codex
  local force=0
  local checkout=''
  local work resolved tag commit version work_root
  local dest installed relation
  local record_status=0
  local created_work=0

  while [[ $# -gt 0 ]]; do
    case $1 in
      --url)
        [[ $# -ge 2 ]] || usage
        url=$2
        shift 2
        ;;
      --target)
        [[ $# -ge 2 ]] || usage
        target=$2
        shift 2
        ;;
      --platform)
        [[ $# -ge 2 ]] || usage
        platform=$2
        shift 2
        ;;
      --checkout)
        [[ $# -ge 2 ]] || usage
        checkout=$2
        shift 2
        ;;
      --force)
        force=1
        shift
        ;;
      *)
        if looks_like_version_request "$1"; then
          refuse_requested_version
        fi
        usage
        ;;
    esac
  done

  if [[ -z "${url}" || -z "${target}" ]]; then
    usage
  fi
  dest=$(destination_for "${target}" "${platform}")

  if [[ -n "${checkout}" ]]; then
    work=${checkout}
    resolved=$(pin_latest "${work}" "${url}")
  else
    created_work=1
    work_root=$(mktemp -d)
    work="${work_root}/release"
    resolved=$(fetch_release "${url}" "${work}")
  fi
  IFS=$'\t' read -r tag commit version << EOF
${resolved}
EOF

  if [[ "${created_work}" -eq 1 ]]; then
    trap 'rm -rf -- '"${work_root}" EXIT
  fi

  printf 'Source: %s\n' "${url}"
  printf 'Release: %s (commit %s)\n' "${tag}" "${commit}"
  printf 'Tool path: %s\n' "${dest}"

  if [[ "${force}" -eq 1 ]]; then
    trace_line "apply-force ${dest}"
    run_installer "${work}" "${target}" "${platform}" 1
    printf 'Outcome: installed %s by explicit force.\n' "${version}"
    printf 'Start a fresh session in this tool before invoking dough-update again.\n'
    return 0
  fi

  if [[ ! -d "${dest}" ]]; then
    trace_line "apply-install ${dest}"
    run_installer "${work}" "${target}" "${platform}" 0
    printf 'Installed: unknown\n'
    printf 'Outcome: installed %s.\n' "${version}"
    printf 'Start a fresh session in this tool before invoking dough-update again.\n'
    return 0
  fi

  installed=$(read_record "${dest}/VERSION") || record_status=$?
  if [[ "${record_status}" -eq 2 ]]; then
    trace_line "apply-malformed ${dest}"
    printf 'Installed record: malformed\n'
    printf 'Outcome: refused; preserved the selected installation.\n'
    return 1
  fi

  if [[ -z "${installed}" ]]; then
    trace_line "apply-unknown ${dest}"
    printf 'Installed: unknown\n'
    run_installer "${work}" "${target}" "${platform}" 1
    printf 'Outcome: recorded %s for the previously unknown installation.\n' "${version}"
    printf 'Start a fresh session in this tool before invoking dough-update again.\n'
    return 0
  fi

  printf 'Installed: %s\n' "${installed}"
  relation=$(compare_versions "${installed}" "${version}")
  case "${relation}" in
    equal)
      trace_line "apply-skip-equal ${dest}"
      printf 'Outcome: already current; no installer invocation or installed-file writes.\n'
      ;;
    older)
      trace_line "apply-upgrade ${dest}"
      run_installer "${work}" "${target}" "${platform}" 1
      printf 'Outcome: updated from %s to %s.\n' "${installed}" "${version}"
      printf 'Start a fresh session in this tool before invoking dough-update again.\n'
      ;;
    newer)
      trace_line "apply-newer ${dest}"
      printf 'Outcome: installed %s is newer than source %s; no downgrade or target writes.\n' "${installed}" "${version}"
      ;;
  esac
}

if [[ $# -lt 1 ]]; then
  usage
fi

command=$1
shift
case "${command}" in
  validate-checkout)
    [[ $# -eq 1 ]] || usage
    validate_checkout "$1"
    ;;
  source-version)
    [[ $# -eq 1 ]] || usage
    read_version_file "$1/VERSION"
    ;;
  read-record)
    [[ $# -eq 1 ]] || usage
    read_record "$1"
    ;;
  compare)
    [[ $# -eq 2 ]] || usage
    if ! is_release_version "$1" || ! is_release_version "$2"; then
      echo "Refusing to compare non-release versions" >&2
      exit 1
    fi
    compare_versions "$1" "$2"
    ;;
  destination)
    [[ $# -eq 2 ]] || usage
    destination_for "$1" "$2"
    ;;
  resolve-url)
    [[ $# -eq 1 ]] || usage
    resolve_url "$1"
    ;;
  fetch-release)
    [[ $# -eq 2 ]] || usage
    fetch_release "$1" "$2"
    ;;
  pin-latest)
    [[ $# -eq 1 || $# -eq 2 ]] || usage
    pin_latest "$1" "${2:-}"
    ;;
  apply)
    apply_release "$@"
    ;;
  --version | --tag | --release)
    refuse_requested_version
    ;;
  *)
    if looks_like_version_request "${command}"; then
      refuse_requested_version
    fi
    usage
    ;;
esac

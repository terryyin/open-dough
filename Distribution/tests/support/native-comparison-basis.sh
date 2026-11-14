#!/usr/bin/env bash
# The Git basis of a native comparison: the commit a pair names for its case
# inputs before any arm starts, and the recovery of an earlier record's basis
# from ordinary Git history. A record hashes every case input and harness
# file its arms ran with (`case-input-hash:` and `input-hash:` lines: the
# sha256 of each file's bytes, by its path then), so recovery looks for the
# commit holding exactly those bytes at those paths. A later refresh or
# relocation of the files cannot relabel the record, and no registry exists
# beside the record, the repository's history and the payload repository.
#
#   native_comparison_basis_commit SOURCE_DIR CASE_DIR PATH...
#     Prints SOURCE_DIR's HEAD commit when CASE_DIR (but for its case.md and
#     comparisons/) and every PATH are committed there unchanged; otherwise
#     names what is not and fails.
#   native_comparison_basis_observe RECORD REPO PAYLOAD_REPO
#     Prints the recovery observation of comparison record RECORD from Git
#     repository REPO: the record's own history, its recorded inputs, whether
#     the revision it names holds them, the commit that does (searching REPO's
#     history newest first), and what a rerun would meet now: each arm's
#     frozen payload in PAYLOAD_REPO, its requested label, and the `codex` on
#     PATH beside the host the arms ran. It never judges.
# shellcheck disable=SC2034,SC2312 # Fields print as observed.

declare -gA native_comparison_basis_digests=()

# Leaves case_identity, the pathspec of the case files under CASE_DIR that
# native_comparison_case_files (native-comparison-run.sh) hashes: all but
# the case's description and its kept comparisons.
native_comparison_basis_case_identity() {
  case_identity=("$1" ":(exclude)$1/case.md" ":(exclude)$1/comparisons")
}

native_comparison_basis_commit() {
  local source_dir=$1 case_identity changes
  native_comparison_basis_case_identity "$2"
  shift 2
  changes=$(git -C "${source_dir}" status --porcelain --ignored --untracked-files=all -- \
    "$@" "${case_identity[@]}") || return
  if [[ -n ${changes} ]]; then
    printf 'error: the case basis is not committed; commit it so the pair names the revision that holds it:\n%s\n' \
      "${changes}" >&2
    return 1
  fi
  git -C "${source_dir}" rev-parse HEAD
}

# Prints `unchanged since COMMIT`, `edited since COMMIT (N versions)` or
# `untracked` for RECORD at REPO-relative path RELATIVE: every content the
# path held along REPO's first-parent history, following moves (one edited
# while moving counts both contents), and the file as it is now. A record
# Git sees as a copy of another starts at that copy.
native_comparison_basis_record_history() {
  local repo=$1 relative=$2 record=$3 line status commit='' added=''
  local -A versions=()
  if [[ -z ${relative} ]] || ! git -C "${repo}" ls-files --error-unmatch -- "${relative}" > /dev/null 2>&1; then
    echo untracked
    return
  fi
  while IFS= read -r line; do
    status=${line%%$'\t'*}
    case ${status} in
      'commit '*) commit=${line#commit } && continue ;;
      A | M | R* | C*) ;;
      *) continue ;;
    esac
    versions[$(git -C "${repo}" rev-parse "${commit}:${line##*$'\t'}")]=1
    added=${commit}
    case ${status} in
      R100 | M) ;;
      R*) line=${line#*$'\t'} && versions[$(git -C "${repo}" rev-parse "${commit}^:${line%%$'\t'*}")]=1 ;;
      *) break ;;
    esac
  done < <(git -C "${repo}" log --first-parent --follow --format='commit %H' --name-status -- "${relative}")
  versions[$(git hash-object -- "${record}")]=1
  if [[ ${#versions[@]} -eq 1 ]]; then
    printf 'unchanged since %s\n' "${added}"
  else
    printf 'edited since %s (%s versions)\n' "${added}" "${#versions[@]}"
  fi
}

# Prints how many recorded inputs COMMIT of REPO lacks: a path missing or
# holding other bytes, or a case file the record does not list. Reads
# native_comparison_basis_paths, _hashes, _case_dir and _empty_tree.
native_comparison_basis_lacks() {
  local repo=$1 commit=$2 old_mode mode old_blob blob change path index lacking=0 case_identity
  local -A blobs=()
  native_comparison_basis_case_identity "${native_comparison_basis_case_dir}"
  # Every file COMMIT holds at those paths, as added to an empty tree.
  while read -r old_mode mode old_blob blob change path; do
    blobs[${path}]=${blob}
  done < <(git -C "${repo}" diff-tree -r --no-commit-id "${native_comparison_basis_empty_tree}" "${commit}" -- \
    "${native_comparison_basis_paths[@]}" "${case_identity[@]}")
  for index in "${!native_comparison_basis_paths[@]}"; do
    path=${native_comparison_basis_paths[index]}
    blob=${blobs[${path}]-}
    unset 'blobs[${path}]'
    if [[ -z ${blob} ]]; then
      lacking=$((lacking + 1))
      continue
    fi
    [[ -n ${native_comparison_basis_digests[${blob}]-} ]] \
      || native_comparison_basis_digests[${blob}]=$(git -C "${repo}" cat-file blob "${blob}" \
        | shasum -a 256 | cut -d ' ' -f 1)
    [[ ${native_comparison_basis_digests[${blob}]} == "${native_comparison_basis_hashes[index]}" ]] \
      || lacking=$((lacking + 1))
  done
  printf '%s\n' "$((lacking + ${#blobs[@]}))"
}

native_comparison_basis_observe() {
  local record=$1 repo=$2 payload_repo=$3 relative='' name named lacks commit basis=none searched=0
  local hash path arm tree requested now host
  local -a native_comparison_basis_paths=() native_comparison_basis_hashes=()
  local native_comparison_basis_case_dir='' native_comparison_basis_empty_tree
  native_comparison_basis_empty_tree=$(git -C "${repo}" hash-object -t tree /dev/null)
  record=$(cd -- "$(dirname -- "${record}")" && pwd -P)/$(basename -- "${record}")
  repo=$(cd -- "${repo}" && pwd -P)
  [[ ${record} != "${repo}/"* ]] || relative=${record#"${repo}/"}
  printf 'record: %s\n' "${relative:-${record}}"
  printf 'record-history: %s\n' "$(native_comparison_basis_record_history "${repo}" "${relative}" "${record}")"
  while read -r hash path; do
    native_comparison_basis_hashes+=("${hash}")
    native_comparison_basis_paths+=("${path}")
  done < <(sed -nE 's/^(case-)?input-hash: ([0-9a-f]{64}) (.+)$/\2 \3/p' "${record}")
  printf 'recorded-inputs: %s\n' "${#native_comparison_basis_paths[@]}"
  name=$(sed -nE 's/^(comparison|case): (native-comparison\/)?//p' "${record}" | head -n 1)
  for path in "${native_comparison_basis_paths[@]}"; do
    [[ ${path} == *"native-comparison/${name}/"* ]] || continue
    native_comparison_basis_case_dir=${path%%"native-comparison/${name}/"*}native-comparison/${name}
    break
  done
  if [[ -z ${name} || -z ${native_comparison_basis_case_dir} ]]; then
    printf 'named-revision: none\ncase-basis-revision: none\ncase-basis-searched: no case directory recorded\n'
  else
    named=$(sed -nE 's/^(case-basis|case-source|source)-revision: //p' "${record}" | head -n 1)
    if [[ -z ${named} ]]; then
      printf 'named-revision: none\n'
    elif ! git -C "${repo}" rev-parse -q --verify "${named}^{commit}" > /dev/null; then
      printf 'named-revision: %s is not a commit of this repository\n' "${named}"
    else
      lacks=$(native_comparison_basis_lacks "${repo}" "${named}")
      if [[ ${lacks} -eq 0 ]]; then
        printf 'named-revision: %s holds the recorded inputs\n' "${named}"
        basis=${named}
      else
        printf 'named-revision: %s lacks %s of the recorded inputs\n' "${named}" "${lacks}"
      fi
    fi
    if [[ ${basis} == none ]]; then
      while read -r commit; do
        searched=$((searched + 1))
        [[ $(native_comparison_basis_lacks "${repo}" "${commit}") -eq 0 ]] || continue
        basis=${commit}
        break
      done < <(git -C "${repo}" rev-list --full-history HEAD -- \
        "${native_comparison_basis_paths[@]}" "${native_comparison_basis_case_dir}")
    fi
    printf 'case-basis-revision: %s\n' "${basis}"
    printf 'case-basis-searched: %s commits\n' "${searched}"
    printf 'case-basis-directory: %s\n' "${native_comparison_basis_case_dir}"
  fi
  for arm in baseline candidate; do
    commit='' requested=''
    read -r commit tree requested < <(sed -n "s/^${arm}-payload: //p" "${record}") || true
    [[ -n ${commit-} ]] || continue
    now=missing
    git -C "${payload_repo}" cat-file -e "${commit}^{commit}" 2> /dev/null && now=present
    printf '%s-payload-now: %s %s\n' "${arm}" "${commit}" "${now}"
    requested=${requested#requested=}
    [[ -n ${requested} && ${requested} != "${commit}" ]] || continue
    now=$(git -C "${payload_repo}" rev-parse -q --verify "${requested}^{commit}") || now=''
    case ${now} in
      "${commit}") now='still names the frozen commit' ;;
      '') now='names no commit' ;;
      *) now="now names ${now}" ;;
    esac
    printf '%s-requested-now: %s %s\n' "${arm}" "${requested}" "${now}"
  done
  host=$(sed -nE 's/^(baseline|candidate)-host: //p' "${record}" | LC_ALL=C sort -u | paste -sd ';' -)
  printf 'host-recorded: %s\n' "${host:-unknown}"
  printf 'host-now: %s\n' "$(codex --version 2> /dev/null | head -n 1 | grep . || echo unavailable)"
  printf 'project-basis-recorded: %s\n' "$(sed -n 's/^baseline-project-basis: //p' "${record}" | grep . || echo unknown)"
}

#!/usr/bin/env bash
# Exact, path-sorted snapshots for test fixture trees.

snapshot_path_state() {
  local root=$1
  local path relative symlink_target hash_output hash_line digest snapshot_digest kind
  local index=0 offset=0 batch_index entry_index batch_size expected
  local -a paths=() kinds=() details=() regular_paths=() regular_indices=()

  while IFS= read -r -d '' path; do
    relative=${path#"${root}/"}
    if [[ -L ${path} ]]; then
      symlink_target=$(readlink "${path}")
      kind=symlink
    elif [[ -f ${path} ]]; then
      kind='file'
      symlink_target=
      regular_paths+=("${path}")
      regular_indices+=("${index}")
    elif [[ -d ${path} ]]; then
      kind=directory
      symlink_target=
    else
      kind=other
      symlink_target=
    fi
    paths+=("${relative}")
    kinds+=("${kind}")
    details+=("${symlink_target}")
    ((index += 1))
  done < <(
    # shellcheck disable=SC2312 # pipefail preserves failures across the sorted snapshot pipeline.
    find "${root}" -mindepth 1 -path "${root}/.git" -prune -o -print0 \
      | LC_ALL=C sort -z
  )

  while ((offset < ${#regular_paths[@]})); do
    # One shasum per 512 files covers an installed payload tree in one process
    # while keeping each argument list far below the platform limit.
    batch_size=512
    if ((batch_size > ${#regular_paths[@]} - offset)); then
      batch_size=$((${#regular_paths[@]} - offset))
    fi
    if ! hash_output=$(shasum -a 256 \
      "${regular_paths[@]:offset:batch_size}"); then
      return 1
    fi

    batch_index=0
    while IFS= read -r hash_line; do
      snapshot_digest=${hash_line%% *}
      digest=${snapshot_digest}
      [[ ${digest:0:1} == \\ ]] && digest=${digest:1}
      if ((${#digest} != 64)) || [[ ${digest} == *[!0-9a-f]* ]] \
        || ((batch_index >= batch_size)); then
        echo 'Unexpected shasum output while snapshotting fixture' >&2
        return 1
      fi
      entry_index=${regular_indices[offset + batch_index]}
      details[entry_index]=${snapshot_digest}
      ((batch_index += 1))
    done <<< "${hash_output}"
    expected=${batch_size}
    if ((batch_index != expected)); then
      echo 'Incomplete shasum output while snapshotting fixture' >&2
      return 1
    fi
    ((offset += batch_size))
  done

  for ((index = 0; index < ${#paths[@]}; index += 1)); do
    case ${kinds[index]} in
      file | symlink)
        printf '%s\t%s\t%s\n' "${kinds[index]}" "${paths[index]}" "${details[index]}"
        ;;
      directory | other)
        printf '%s\t%s\n' "${kinds[index]}" "${paths[index]}"
        ;;
      *)
        echo 'Unexpected path classification while snapshotting fixture' >&2
        return 1
        ;;
    esac
  done
}

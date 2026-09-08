#!/usr/bin/env bash
# Classify dough-adr-awareness skill paths as installed, wrong-copy, or other.
# Sourced by host activation decode; not a public caller entry.
# shellcheck disable=SC2249,SC2312 # Host cases are exhaustive for known hosts; process substitution is pipefail-protected.

native_activation_append() {
  local dest=$1
  local line=$2
  local current

  current=${!dest:-}
  if [[ -n ${current} ]]; then
    printf -v "${dest}" '%s\n%s' "${current}" "${line}"
  else
    printf -v "${dest}" '%s' "${line}"
  fi
}

native_activation_skill_relpath() {
  case $1 in
    codex) printf '%s\n' '.agents/skills/dough-adr-awareness/SKILL.md' ;;
    cursor) printf '%s\n' '.agents/skills/dough-adr-awareness/SKILL.md' ;;
    claude) printf '%s\n' '.claude/skills/dough-adr-awareness/SKILL.md' ;;
    *) return 2 ;;
  esac
}

native_activation_other_relpaths() {
  case $1 in
    codex)
      printf '%s\n' '.cursor/skills/dough-adr-awareness/SKILL.md'
      printf '%s\n' '.claude/skills/dough-adr-awareness/SKILL.md'
      ;;
    cursor)
      printf '%s\n' '.cursor/skills/dough-adr-awareness/SKILL.md'
      printf '%s\n' '.claude/skills/dough-adr-awareness/SKILL.md'
      ;;
    claude)
      printf '%s\n' '.agents/skills/dough-adr-awareness/SKILL.md'
      printf '%s\n' '.cursor/skills/dough-adr-awareness/SKILL.md'
      ;;
  esac
}

native_activation_classify_path() {
  local path=$1
  local installed=$2
  local candidate=$3
  local host=$4
  local rel other

  if [[ -z ${path} ]]; then
    printf 'none\n'
    return 0
  fi
  if [[ -n ${candidate} && ${path} == "${candidate}"* ]]; then
    printf 'wrong-copy\n'
    return 0
  fi
  if [[ ${path} == *src/skills/dough-adr-awareness/SKILL.md ]]; then
    printf 'wrong-copy\n'
    return 0
  fi
  rel=$(native_activation_skill_relpath "${host}")
  if [[ ${path} == "${installed}" || ${path} == "${rel}" || ${path} == */"${rel}" ]]; then
    printf 'installed\n'
    return 0
  fi
  while IFS= read -r other; do
    [[ -z ${other} ]] && continue
    if [[ ${path} == "${other}" || ${path} == */"${other}" ]]; then
      printf 'wrong-copy\n'
      return 0
    fi
  done < <(native_activation_other_relpaths "${host}")
  if [[ ${path} == *dough-adr-awareness/SKILL.md ]]; then
    printf 'wrong-copy\n'
    return 0
  fi
  printf 'other\n'
}

native_activation_path_from_text() {
  local text=$1
  local candidate=$2
  local host=$3
  local rel other

  if [[ -z ${text} ]]; then
    printf '\n'
    return 0
  fi
  if [[ -n ${candidate} && ${text} == *"${candidate}"* ]]; then
    printf '%s\n' "${candidate}"
    return 0
  fi
  if [[ ${text} == *src/skills/dough-adr-awareness/SKILL.md* ]]; then
    printf '%s\n' 'src/skills/dough-adr-awareness/SKILL.md'
    return 0
  fi
  rel=$(native_activation_skill_relpath "${host}")
  if [[ ${text} == *"${rel}"* ]]; then
    printf '%s\n' "${rel}"
    return 0
  fi
  while IFS= read -r other; do
    [[ -z ${other} ]] && continue
    if [[ ${text} == *"${other}"* ]]; then
      printf '%s\n' "${other}"
      return 0
    fi
  done < <(native_activation_other_relpaths "${host}")
  if [[ ${text} == *dough-adr-awareness/SKILL.md* ]]; then
    printf '%s\n' 'dough-adr-awareness/SKILL.md'
    return 0
  fi
  printf '\n'
}

#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
skill="${source_dir}/.agents/skills/release-version/SKILL.md"
checker='scripts/check-self-installation.sh'

first_line_number() {
  local needle=$1
  local line
  line=$(awk -v needle="${needle}" 'index($0, needle) { print NR; exit }' "${skill}")
  if [[ -z "${line}" ]]; then
    echo "FAIL: ${skill} must contain: ${needle}" >&2
    exit 1
  fi
  printf '%s\n' "${line}"
}

numbered_step() {
  local heading=$1
  awk -v heading="${heading}" '
    function is_heading() {
      return $0 ~ /^[0-9]+\. / && index($0, heading)
    }
    is_heading() { p = 1 }
    p && /^[0-9]+\. / && !is_heading() { exit }
    p { print }
  ' "${skill}"
}

grep -Fq -- "bash ${checker}" "${skill}"

checker_line=$(first_line_number "${checker}")
stage_line=$(first_line_number 'Stage and commit')
tag_line=$(first_line_number 'annotated tag')

if [[ "${checker_line}" -ge "${stage_line}" ]]; then
  echo "FAIL: ${checker} must appear before Stage and commit." >&2
  exit 1
fi
if [[ "${checker_line}" -ge "${tag_line}" ]]; then
  echo "FAIL: ${checker} must appear before annotated tag." >&2
  exit 1
fi

finalize_step=$(numbered_step 'When the request includes finalization,')
if [[ -z "${finalize_step}" ]]; then
  echo 'FAIL: expected a finalization gate step.' >&2
  exit 1
fi
if [[ "${finalize_step}" != *"${checker}"* ]]; then
  echo "FAIL: ${checker} must appear in the finalization path." >&2
  exit 1
fi

prepare_step=$(numbered_step 'For preparation,')
if [[ -z "${prepare_step}" ]]; then
  echo 'FAIL: expected a For preparation step.' >&2
  exit 1
fi
if [[ "${prepare_step}" == *"${checker}"* ]]; then
  echo 'FAIL: preparation must not require the self-installation check.' >&2
  exit 1
fi
if [[ "${prepare_step}" != *'Do not create a Git tag'* ]]; then
  echo 'FAIL: preparation must remain metadata-only.' >&2
  exit 1
fi

echo 'PASS: release-version names the self-installation check in the finalization path before commit or tag, and does not block prepare.'

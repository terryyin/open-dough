#!/usr/bin/env bash
# CI's lint job acquires its pinned shell lint tools here:
#   SHELLCHECK_VERSION=<v> SHFMT_VERSION=<v> bash scripts/setup-lint-tools.sh
# Acquisition must finish before OPEN_DOUGH_SETUP_DEADLINE_MS (epoch ms, set
# by the job's first step). Both tools can recover from an unavailable GitHub
# release using their upstream images. tests/ci-lint-setup.sh checks setup with
# controlled sources.
set -euo pipefail
# shellcheck disable=SC2154 # Set by the job's deadline step.
remaining=$(((OPEN_DOUGH_SETUP_DEADLINE_MS - $(date +%s) * 1000) / 1000))
if ((remaining <= 0)); then
  echo "::error::Infrastructure setup: lint tool acquisition deadline expired. Restore source connectivity and rerun setup before checks."
  exit 1
fi
timeout --signal=KILL "${remaining}s" bash -euo pipefail << 'TOOLS'
tool_dir=$(mktemp -d)
container=
cleanup() {
  if [[ -n ${container} ]]; then
    docker rm "${container}" > /dev/null || true
  fi
  rm -rf -- "${tool_dir}"
}
trap cleanup EXIT
# Four source attempts at most, leaving time for extraction and installation
# within the 60-second workflow step.
copy_image_tool() {
  local tool=$1 image=$2
  container=$(timeout --foreground --signal=KILL 12s docker create --platform linux/amd64 "${image}")
  docker cp "${container}:/bin/${tool}" "${tool_dir}/${tool}"
  docker rm "${container}" > /dev/null
  container=
}
shellcheck=${tool_dir}/shellcheck
if ! curl --fail --silent --show-error --location --connect-timeout 5 --max-time 12 --retry 0 \
  "https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.linux.x86_64.tar.xz" \
  --output "${tool_dir}/shellcheck.tar.xz" \
  || ! tar -xJf "${tool_dir}/shellcheck.tar.xz" -C "${tool_dir}" --strip-components=1 \
    "shellcheck-v${SHELLCHECK_VERSION}/shellcheck"; then
  echo 'ShellCheck GitHub release acquisition failed; trying the pinned Docker Hub image.'
  # Upstream ShellCheck v0.11.0, Linux amd64.
  copy_image_tool shellcheck docker.io/koalaman/shellcheck@sha256:b9389b73c8f26f710a7171cb7d8848a34a9c1e07a7865e727c9ec4ce99f9a83f
fi
version=$("${shellcheck}" --version)
if ! grep -Fxq -- "version: ${SHELLCHECK_VERSION}" <<< "${version}"; then
  echo "::error::Infrastructure setup: ShellCheck did not match pinned version ${SHELLCHECK_VERSION}."
  exit 1
fi
shfmt=${tool_dir}/shfmt
if ! curl --fail --silent --show-error --location --connect-timeout 5 --max-time 12 --retry 0 \
  "https://github.com/mvdan/sh/releases/download/v${SHFMT_VERSION}/shfmt_v${SHFMT_VERSION}_linux_amd64" \
  --output "${shfmt}"; then
  echo 'shfmt GitHub release acquisition failed; trying the pinned Docker Hub image.'
  # Upstream shfmt v3.14.1, Linux amd64.
  copy_image_tool shfmt docker.io/mvdan/shfmt@sha256:18eb2bf53e31591b63bfc55cce8ad82ff7fd0ed53f506f71726be4942928b999
fi
chmod +x -- "${shfmt}"
version=$("${shfmt}" --version)
if [[ ${version#v} != "${SHFMT_VERSION}" ]]; then
  echo "::error::Infrastructure setup: shfmt did not match pinned version ${SHFMT_VERSION}."
  exit 1
fi
sudo install -m 755 "${shellcheck}" /usr/local/bin/shellcheck
sudo install -m 755 "${shfmt}" /usr/local/bin/shfmt
shellcheck --version
shfmt --version
TOOLS

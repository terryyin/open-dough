#!/usr/bin/env bash
# CI's lint job acquires its pinned shell lint tools here:
#   SHELLCHECK_VERSION=<v> SHFMT_VERSION=<v> bash scripts/setup-lint-tools.sh
# Acquisition must finish before OPEN_DOUGH_SETUP_DEADLINE_MS (epoch ms, set
# by the job's first step). ShellCheck can recover from an unavailable GitHub
# release using the upstream image. tests/ci-lint-setup.sh checks setup with
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
shellcheck=${tool_dir}/shellcheck
if ! curl --fail --silent --show-error --location --connect-timeout 5 --max-time 20 --retry 0 \
  "https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.linux.x86_64.tar.xz" \
  --output "${tool_dir}/shellcheck.tar.xz" \
  || ! tar -xJf "${tool_dir}/shellcheck.tar.xz" -C "${tool_dir}" --strip-components=1 \
    "shellcheck-v${SHELLCHECK_VERSION}/shellcheck"; then
  echo 'ShellCheck GitHub release acquisition failed; trying the pinned Docker Hub image.'
  # Upstream ShellCheck v0.11.0, Linux amd64. Leave time for shfmt's download
  # within the same 60-second workflow step.
  shellcheck_image=docker.io/koalaman/shellcheck@sha256:b9389b73c8f26f710a7171cb7d8848a34a9c1e07a7865e727c9ec4ce99f9a83f
  container=$(timeout --foreground --signal=KILL 15s docker create --platform linux/amd64 "${shellcheck_image}")
  docker cp "${container}:/bin/shellcheck" "${shellcheck}"
fi
version=$("${shellcheck}" --version)
if ! grep -Fxq -- "version: ${SHELLCHECK_VERSION}" <<< "${version}"; then
  echo "::error::Infrastructure setup: ShellCheck did not match pinned version ${SHELLCHECK_VERSION}."
  exit 1
fi
sudo install -m 755 "${shellcheck}" /usr/local/bin/shellcheck
curl --fail --silent --show-error --location --connect-timeout 5 --max-time 20 --retry 0 \
  "https://github.com/mvdan/sh/releases/download/v${SHFMT_VERSION}/shfmt_v${SHFMT_VERSION}_linux_amd64" \
  --output "${tool_dir}/shfmt"
sudo install -m 755 "${tool_dir}/shfmt" /usr/local/bin/shfmt
shellcheck --version
shfmt --version
TOOLS

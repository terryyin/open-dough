#!/usr/bin/env bash
# CI's lint job acquires its pinned shell lint tools here:
#   SHELLCHECK_VERSION=<v> SHFMT_VERSION=<v> bash scripts/setup-lint-tools.sh
# Acquisition must finish before OPEN_DOUGH_SETUP_DEADLINE_MS (epoch ms, set
# by the job's first step); an expired deadline or a stalled or unavailable
# GitHub release source fails without retrying. tests/ci-lint-setup.sh checks
# it with controlled sources.
set -euo pipefail
# shellcheck disable=SC2154 # Set by the job's deadline step.
remaining=$(((OPEN_DOUGH_SETUP_DEADLINE_MS - $(date +%s) * 1000) / 1000))
if ((remaining <= 0)); then
  echo "::error::Infrastructure setup: lint tool acquisition deadline expired. Restore GitHub release connectivity and rerun setup before checks."
  exit 1
fi
timeout --signal=KILL "${remaining}s" bash -euo pipefail << 'TOOLS'
tool_dir=$(mktemp -d)
trap 'rm -rf -- "${tool_dir}"' EXIT
curl --fail --silent --show-error --location --connect-timeout 5 --max-time 20 --retry 0 \
  "https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.linux.x86_64.tar.xz" \
  --output "${tool_dir}/shellcheck.tar.xz"
tar -xJf "${tool_dir}/shellcheck.tar.xz" -C "${tool_dir}"
sudo install -m 755 "${tool_dir}/shellcheck-v${SHELLCHECK_VERSION}/shellcheck" /usr/local/bin/shellcheck
curl --fail --silent --show-error --location --connect-timeout 5 --max-time 20 --retry 0 \
  "https://github.com/mvdan/sh/releases/download/v${SHFMT_VERSION}/shfmt_v${SHFMT_VERSION}_linux_amd64" \
  --output "${tool_dir}/shfmt"
sudo install -m 755 "${tool_dir}/shfmt" /usr/local/bin/shfmt
shellcheck --version
shfmt --version
TOOLS

#!/usr/bin/env bash
# shellcheck disable=SC2154 # Calling test scripts supply source_dir.

prepare_installed_adr_awareness_codex_target() {
  local target=$1
  local candidate=$2
  local fixture_source="${source_dir}/tests/fixtures/adr-awareness/installed-use"

  mkdir -p -- "${target}"
  cp -R -- "${fixture_source}/." "${target}/"
  bash "${candidate}/install.sh" --target "${target}" --platform codex
}

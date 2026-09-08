#!/usr/bin/env bash
# shellcheck disable=SC2154 # Calling test scripts supply source_dir.

prepare_installed_adr_awareness_target() {
  local target=$1
  local candidate=$2
  local platform=$3
  local fixture_source="${source_dir}/tests/fixtures/adr-awareness/installed-use"
  local caller skill_root

  case ${platform} in
    codex) skill_root='.agents/skills' ;;
    cursor) skill_root='.cursor/skills' ;;
    claude) skill_root='.claude/skills' ;;
    *) return 2 ;;
  esac

  mkdir -p -- "${target}"
  cp -R -- "${fixture_source}/." "${target}/"
  bash "${candidate}/install.sh" --target "${target}" --source "${candidate}" \
    --platform "${platform}"

  if [[ ${skill_root} != '.agents/skills' ]]; then
    for caller in \
      .cursor/agent-map.md \
      .cursor/rules/architecture-decisions.mdc \
      docs/adrs/README.md; do
      sed "s|.agents/skills/dough-adr-awareness|${skill_root}/dough-adr-awareness|g" \
        "${target}/${caller}" > "${target}/${caller}.adapted"
      mv -- "${target}/${caller}.adapted" "${target}/${caller}"
    done
  fi

  if [[ ${platform} == 'claude' ]]; then
    printf '@AGENTS.md\n' > "${target}/CLAUDE.md"
  fi
}

prepare_installed_adr_awareness_codex_target() {
  prepare_installed_adr_awareness_target "$1" "$2" codex
}

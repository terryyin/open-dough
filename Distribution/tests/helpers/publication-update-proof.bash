# Shared observation for an ordinary update: the caller plants project
# configuration, and the update leaves it unchanged.
# shellcheck shell=bash

project_configuration='{"sentinel":"project-owned-open-dough"}'

write_project_configuration() {
  local target=$1
  mkdir -p -- "${target}/.planning"
  printf '%s\n' "${project_configuration}" > "${target}/.planning/open-dough.json"
}

assert_project_configuration() {
  local target=$1
  local contents
  contents=$(cat "${target}/.planning/open-dough.json")
  [[ "${contents}" == "${project_configuration}" ]]
}

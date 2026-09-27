#!/usr/bin/env bash
# Shared by publication journeys whose fixture a Node script prepares
# (admission, one-shot): adopting the coordinates it prints and listing the
# startup commands a session ran. Sourced by the runner.
# shellcheck disable=SC2034 # Fixture globals are consumed by the runner.

# Adopts prepared fixture JSON $1: {root, origin, integration, workspace, base}.
git_publication_fixture_adopt_prepared() {
  local prepared=$1
  git_publication_fixture_root=$(jq -r .root <<< "${prepared}")
  git_publication_fixture_origin=$(jq -r .origin <<< "${prepared}")
  git_publication_fixture_integration=$(jq -r .integration <<< "${prepared}")
  git_publication_fixture_workspace=$(jq -r .workspace <<< "${prepared}")
  git_publication_fixture_trunk_sha=$(jq -r .base <<< "${prepared}")
  git_publication_fixture_candidate_sha=
}

# Distinct execution-start commands transcript $1 shows, in either stream shape.
git_publication_transcript_start_commands() {
  {
    jq -r 'select(.type == "item.started" and .item.type == "command_execution") | .item.command // empty' "$1"
    jq -r '.. | objects | .command? // empty' "$1"
  } 2> /dev/null | grep -F 'execution-start.mjs start' | sort -u || true
}

#!/usr/bin/env bash
# Credential-free substitute-host suite for tests/git-publication-native.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by sourced helpers.

run_substitute_host_journeys() {
  local work sentinel_bin run_log host journey journey_host
  local artifact status
  work=$(mktemp -d)
  sentinel_bin="${work}/bin"
  run_log="${work}/run.log"
  mkdir -p -- "${sentinel_bin}"
  for host in codex cursor claude; do
    cp -- "${source_dir}/tests/support/native-agent-publication.sh" \
      "${sentinel_bin}/${host}"
    chmod a+x "${sentinel_bin}/${host}"
  done

  export PATH="${sentinel_bin}:${PATH}"
  # Credential-free counterexamples do not retain attempt directories.
  native_case_results_dir=

  for host in codex cursor claude; do
    artifact=$(mktemp -d "${work}/${host}-publish.XXXXXX")
    : > "${run_log}"
    set +e
    NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
      git_publication_run_journey "${source_dir}" "${host}" \
      publish-boundary "${artifact}"
    status=$?
    set -e
    if [[ ${status} -ne 0 ]]; then
      echo "FAIL: substitute ${host} publish-boundary exited ${status}." >&2
      cat "${artifact}/stderr.log" >&2 || true
      cat "${artifact}/response.md" >&2 || true
      exit 1
    fi
    if [[ ${git_publication_assess_status} != 'pass' ]]; then
      echo "FAIL: substitute ${host} publish-boundary assessment ${git_publication_assess_status}: ${git_publication_assess_reason}" >&2
      cat "${artifact}/observations.txt" >&2 || true
      cat "${artifact}/response.md" >&2 || true
      exit 1
    fi
    if ! grep -Fq "${host}" "${run_log}"; then
      echo "FAIL: substitute ${host} left no invocation log." >&2
      cat "${run_log}" >&2
      exit 1
    fi
  done

  artifact=$(mktemp -d "${work}/codex-trunc.XXXXXX")
  set +e
  NATIVE_AGENT_SENTINEL_LOG="${run_log}" NATIVE_AGENT_STREAM=truncated \
    git_publication_run_journey "${source_dir}" codex publish-boundary \
    "${artifact}"
  status=$?
  set -e
  unset NATIVE_AGENT_STREAM
  [[ ${status} -ne 0 ]]
  git_publication_suite_expect_assess fail 'incomplete or stale native stream'

  artifact=$(mktemp -d "${work}/codex-skip.XXXXXX")
  set +e
  NATIVE_AGENT_SENTINEL_LOG="${run_log}" NATIVE_PUBLICATION_SKIP_PUSH=1 \
    git_publication_run_journey "${source_dir}" codex publish-boundary \
    "${artifact}"
  status=$?
  set -e
  unset NATIVE_PUBLICATION_SKIP_PUSH
  [[ ${status} -eq 0 ]]
  git_publication_suite_expect_assess fail 'missing remote acceptance'

  for journey in local-only claim-race uncertain-recovery preparation \
    story-branch-increment \
    trunk-closure story-branch-closure bug-disposition; do
    journey_host=cursor
    if [[ ${journey} == 'story-branch-increment' ]]; then
      journey_host=codex
    fi
    artifact=$(mktemp -d "${work}/journey-${journey}.XXXXXX")
    set +e
    NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
      git_publication_run_journey "${source_dir}" "${journey_host}" "${journey}" \
      "${artifact}"
    status=$?
    set -e
    if [[ ${status} -ne 0 ]]; then
      echo "FAIL: substitute ${journey_host} ${journey} exited ${status}." >&2
      cat "${artifact}/stderr.log" >&2 || true
      exit 1
    fi
    if [[ ${git_publication_assess_status} != 'pass' ]]; then
      echo "FAIL: substitute ${journey_host} ${journey} assessment ${git_publication_assess_status}: ${git_publication_assess_reason}" >&2
      cat "${artifact}/observations.txt" >&2
      cat "${artifact}/response.md" >&2 || true
      exit 1
    fi
  done

  echo 'PASS: credential-free publication runner exercises complete streams on Codex, Cursor, and Claude Code substitutes; rejects truncated streams and missing remote acceptance; and covers local-only, claim-race, uncertain-recovery, preparation, first Story Branch increment, trunk-closure, story-branch-closure, and bug-disposition journeys.'
  echo 'EVIDENCE: mechanical Git observations plus substitute adapter streams; not live native agent behavior. Live host proof remains under --native.'
}

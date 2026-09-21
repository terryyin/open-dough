#!/usr/bin/env bash
# Credential-free assessor/substitute suites for tests/git-publication-native.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by the sourced entry/runner.

git_publication_suite_write_obs() {
  local dest=$1
  shift
  printf '%s\n' "$@" > "${dest}"
}

# Write a publish-boundary observation file, then apply journey/field overrides.
# Overrides are KEY=VALUE pairs after the destination path.
git_publication_suite_obs() {
  local dest=$1
  shift
  local journey=publish-boundary
  local authority=publish
  local stream=complete
  local remote_accepted=true
  local remote_sha=abc111
  local candidate_sha=abc111
  local human_preserved=true
  local ownership=owned
  local maintenance=deferred
  local override
  for override in "$@"; do
    case ${override} in
      journey=*) journey=${override#journey=} ;;
      authority=*) authority=${override#authority=} ;;
      stream-status=*) stream=${override#stream-status=} ;;
      remote-accepted=*) remote_accepted=${override#remote-accepted=} ;;
      remote-sha=*) remote_sha=${override#remote-sha=} ;;
      candidate-sha=*) candidate_sha=${override#candidate-sha=} ;;
      human-edit-preserved=*) human_preserved=${override#human-edit-preserved=} ;;
      claim-ownership=*) ownership=${override#claim-ownership=} ;;
      maintenance-result=*) maintenance=${override#maintenance-result=} ;;
      *)
        printf 'error: unknown observation override %s\n' "${override}" >&2
        return 2
        ;;
    esac
  done
  git_publication_suite_write_obs "${dest}" \
    "journey: ${journey}" \
    "authority: ${authority}" \
    "stream-status: ${stream}" \
    "remote-accepted: ${remote_accepted}" \
    "remote-sha: ${remote_sha}" \
    "candidate-sha: ${candidate_sha}" \
    "human-edit-preserved: ${human_preserved}" \
    "claim-ownership: ${ownership}" \
    "maintenance-result: ${maintenance}"
}

git_publication_suite_expect_assess() {
  local want_status=$1
  local want_reason_fragment=${2-}
  [[ ${git_publication_assess_status} == "${want_status}" ]]
  if [[ -n ${want_reason_fragment} ]]; then
    grep -Fq "${want_reason_fragment}" <<< "${git_publication_assess_reason}"
  fi
}

run_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  git_publication_suite_obs "${work}/valid.txt"
  printf '%s\n' \
    'Published the owned candidate. The remote accepted that revision on main. Maintenance is deferred because a human edit remains on the default checkout.' \
    > "${work}/valid-response.md"
  git_publication_assess "${work}/valid.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess pass \
    'remote acceptance with preserved human edit'

  # Equivalent wording paraphrase still passes.
  printf '%s\n' \
    'The candidate landed on remote trunk and was accepted. Pending local work on another checkout stayed untouched.' \
    > "${work}/paraphrase.md"
  git_publication_assess "${work}/valid.txt" "${work}/paraphrase.md"
  git_publication_suite_expect_assess pass

  git_publication_suite_obs "${work}/missing-remote.txt" \
    remote-accepted=false remote-sha=trunk000
  git_publication_assess "${work}/missing-remote.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'missing remote acceptance'

  git_publication_suite_obs "${work}/captured-edit.txt" \
    human-edit-preserved=false
  git_publication_assess "${work}/captured-edit.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'human edit was not preserved'

  git_publication_suite_obs "${work}/wrong-owner.txt" claim-ownership=wrong
  git_publication_assess "${work}/wrong-owner.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'wrong claim ownership'

  git_publication_suite_obs "${work}/claim-race-foreign-accepted.txt" \
    journey=claim-race claim-ownership=foreign
  printf '%s\n' \
    'Stopped for a recoverable conflict; another claim owns the remote.' \
    > "${work}/claim-race-recovery.md"
  git_publication_assess "${work}/claim-race-foreign-accepted.txt" \
    "${work}/claim-race-recovery.md"
  git_publication_suite_expect_assess fail \
    'claim-race foreign ownership with remote acceptance'

  git_publication_suite_obs "${work}/incomplete.txt" stream-status=truncated
  git_publication_assess "${work}/incomplete.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'incomplete or stale native stream'

  git_publication_suite_obs "${work}/stale.txt" stream-status=stale
  git_publication_assess "${work}/stale.txt" "${work}/valid-response.md"
  git_publication_suite_expect_assess fail 'incomplete or stale native stream'

  git_publication_suite_obs "${work}/local-only.txt" \
    journey=local-only authority=local-only remote-accepted=false \
    remote-sha=trunk000 claim-ownership=n/a maintenance-result=n/a
  printf '%s\n' \
    'Retained locally under local-only authority. Publication remains pending.' \
    > "${work}/local-only.md"
  git_publication_assess "${work}/local-only.txt" "${work}/local-only.md"
  git_publication_suite_expect_assess pass

  echo 'PASS: publication assessor accepts equivalent publication wording and local-only retention; rejects missing remote acceptance, captured human edits, wrong claim ownership, claim-race foreign ownership with remote acceptance, and incomplete or stale streams.'
}

run_substitute_host_journeys() {
  local work sentinel_bin run_log host journey
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
    trunk-closure story-branch-closure bug-disposition; do
    artifact=$(mktemp -d "${work}/journey-${journey}.XXXXXX")
    set +e
    NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
      git_publication_run_journey "${source_dir}" cursor "${journey}" \
      "${artifact}"
    status=$?
    set -e
    if [[ ${status} -ne 0 ]]; then
      echo "FAIL: substitute cursor ${journey} exited ${status}." >&2
      cat "${artifact}/stderr.log" >&2 || true
      exit 1
    fi
    if [[ ${git_publication_assess_status} != 'pass' ]]; then
      echo "FAIL: substitute cursor ${journey} assessment ${git_publication_assess_status}: ${git_publication_assess_reason}" >&2
      cat "${artifact}/observations.txt" >&2
      cat "${artifact}/response.md" >&2 || true
      exit 1
    fi
  done

  echo 'PASS: credential-free publication runner exercises complete streams on Codex, Cursor, and Claude Code substitutes; rejects truncated streams and missing remote acceptance; and covers local-only, claim-race, uncertain-recovery, preparation, trunk-closure, story-branch-closure, and bug-disposition journeys.'
  echo 'EVIDENCE: mechanical Git observations plus substitute adapter streams; not live native agent behavior. Live host proof remains under --native.'
}

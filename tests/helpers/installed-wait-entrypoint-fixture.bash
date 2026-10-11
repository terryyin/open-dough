# Installed mailbox wait journey shared by payload-update proofs.
# Requires temporary_dir and source_dir from the calling test.
# shellcheck shell=bash
: "${temporary_dir:?temporary_dir must be set before sourcing this helper}"
: "${source_dir:?source_dir must be set before sourcing this helper}"

assert_installed_wait_entrypoints() {
  local target=$1
  local provider_bin="${temporary_dir}/installed-wait-bin"
  local storage="${temporary_dir}/installed-wait-mailboxes"
  local root route canonical_root receipt mailbox awaited diagnostic owner_root
  local gh_calls="${temporary_dir}/installed-wait-gh-calls"
  mkdir -p -- "${provider_bin}" "${storage}"
  : > "${gh_calls}"
  export INSTALLED_WAIT_GH_CALLS="${gh_calls}"
  # The installed requests' owner stands at an endpoint of this journey's
  # own, short enough for its socket path, and ends as its consumers leave.
  owner_root=$(mktemp -d "${TMPDIR:-/tmp}/ghr-XXXXXX")
  export DOUGH_GITHUB_REQUEST_OWNER_ROOT="${owner_root}" DOUGH_GITHUB_REQUEST_OWNER_IDLE_MS=100
  cat > "${provider_bin}/gh" << 'EOF'
#!/usr/bin/env node
// Answers as `gh api --include` does, and logs each call's arguments.
const [api, include, route = ''] = process.argv.slice(2);
require('node:fs').appendFileSync(process.env.INSTALLED_WAIT_GH_CALLS, `${process.argv.slice(2).join(' ')}\n`);
if (api !== 'api' || include !== '--include') process.exit(1);
const answer = (body) => process.stdout.write(`HTTP/2.0 200 OK\r\n\r\n${JSON.stringify(body)}`);
if (/\/actions\/workflows\/ci\.yml$/.test(route)) {
  answer({ id: 7001, name: 'CI', path: '.github/workflows/ci.yml', state: 'active' });
} else if (/\/actions\/workflows\/7001\/runs\?/.test(route)) {
  answer({ total_count: 1, workflow_runs: [{
    id: 901,
    run_attempt: 1,
    head_sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    head_branch: 'main',
    event: 'push',
    status: 'completed',
    conclusion: 'success',
    html_url: 'https://example.test/actions/901'
  }] });
} else if (/\/actions\/runs\/901\/attempts\/1\/jobs\?/.test(route)) {
  answer({ total_count: 2, jobs: [
    { id: 9011, name: 'build', status: 'completed', conclusion: 'success' },
    { id: 9012, name: 'test', status: 'completed', conclusion: 'failure',
      html_url: 'https://example.test/actions/901/job/9012',
      steps: [{ number: 3, name: 'Run tests', conclusion: 'failure' }] },
  ] });
} else if (/\/actions\/jobs\/9012\/logs$/.test(route)) {
  process.stdout.write('HTTP/2.0 200 OK\r\n\r\n2026-10-11T00:00:00.0000000Z ##[error]installed diagnostic fixture failure\n');
} else {
  process.exit(1);
}
EOF
  chmod +x "${provider_bin}/gh"
  for root in .agents/skills .claude/skills; do
    canonical_root=$(cd "${target}/${root}/dough-execute-plan" && pwd -P)
    receipt=$(PATH="${provider_bin}:${PATH}" DOUGH_CI_MAILBOX_ROOT="${storage}" \
      node "${canonical_root}/scripts/ci-mailbox.mjs" start --execution owner/repo main 60000)
    mailbox=$(node -e 'process.stdout.write(JSON.parse(process.argv[1].slice("CI_OBSERVER ".length)).directory)' "${receipt}")
    DOUGH_CI_MAILBOX_ROOT="${storage}" \
      node "${canonical_root}/scripts/ci-mailbox.mjs" register-push "${mailbox}" \
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa > /dev/null
    awaited=$(DOUGH_CI_MAILBOX_ROOT="${storage}" \
      node "${canonical_root}/scripts/ci-mailbox.mjs" await-revision "${mailbox}" \
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa)
    node -e '
      const receipt = process.argv[1];
      if (!receipt.startsWith("CI_OBSERVER ")) process.exit(1);
      const result = JSON.parse(receipt.slice("CI_OBSERVER ".length));
      if (result.verdict !== "success" ||
          result.requestedSha !== "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" ||
          result.target?.repo !== "owner/repo" ||
          result.target?.branch !== "main" ||
          result.effectiveEvidence?.source !== "exact") process.exit(1);
    ' "${awaited}"
    DOUGH_CI_MAILBOX_ROOT="${storage}" \
      node "${canonical_root}/scripts/ci-mailbox.mjs" stop "${mailbox}" > /dev/null
    # The installed diagnostic entry reads the failed job and its log excerpt.
    diagnostic=$(PATH="${provider_bin}:${PATH}" \
      node "${canonical_root}/scripts/ci-github-diagnostic.mjs" failure owner/repo 901 1)
    node -e '
      const { type, failedJobs } = JSON.parse(process.argv[1]);
      const [job] = failedJobs;
      if (type !== "CI_FAILURE_DIAGNOSTIC" || failedJobs.length !== 1 ||
          job.jobId !== 9012 || job.name !== "test" ||
          job.failedSteps[0]?.name !== "Run tests" ||
          job.log.lines.join() !== "##[error]installed diagnostic fixture failure")
        process.exit(1);
    ' "${diagnostic}"
  done
  # Every installed request reached GitHub as `gh api --include`: the
  # observer's workflow and listing, and the diagnostic's jobs and log.
  if grep -v '^api --include repos/owner/repo/actions/' "${gh_calls}"; then
    printf 'An installed CI request bypassed gh api --include.\n' >&2
    return 1
  fi
  for route in 'workflows/ci.yml$' 'workflows/7001/runs?' 'runs/901/attempts/1/jobs?' 'jobs/9012/logs$'; do
    grep -q -- "actions/${route}" "${gh_calls}" || {
      printf 'No installed gh api request for %s.\n' "${route}" >&2
      return 1
    }
  done
  node -e 'import(process.argv[1]).then((fixtures) => fixtures.endRequestOwners(process.argv[2]))' \
    "${source_dir}/src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs" "${owner_root}"
  unset INSTALLED_WAIT_GH_CALLS DOUGH_GITHUB_REQUEST_OWNER_ROOT DOUGH_GITHUB_REQUEST_OWNER_IDLE_MS
}

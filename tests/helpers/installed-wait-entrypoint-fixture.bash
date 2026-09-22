# Installed mailbox wait journey shared by payload-update proofs.
# Requires temporary_dir from the calling test.
# shellcheck shell=bash
: "${temporary_dir:?temporary_dir must be set before sourcing this helper}"

assert_installed_wait_entrypoints() {
  local target=$1
  local provider_bin="${temporary_dir}/installed-wait-bin"
  local storage="${temporary_dir}/installed-wait-mailboxes"
  local root canonical_root receipt mailbox awaited
  mkdir -p -- "${provider_bin}" "${storage}"
  cat > "${provider_bin}/gh" << 'EOF'
#!/usr/bin/env node
if (process.argv[2] === 'run' && process.argv[3] === 'list') {
  process.stdout.write(JSON.stringify([{
    databaseId: 901,
    attempt: 1,
    headSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    headBranch: 'main',
    workflowName: 'CI',
    event: 'push',
    status: 'completed',
    conclusion: 'success',
    url: 'https://example.test/actions/901'
  }]));
} else {
  process.stdout.write(JSON.stringify({ jobs: [] }));
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
  done
}

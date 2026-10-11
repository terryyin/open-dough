#!/usr/bin/env bash
# Every check the runner starts is given a GitHub request owner root that
# admits no owner: a check whose process asks GitHub without a root of its own
# fails naming that, and its `gh` is never asked; a check that names its own
# root is answered through an owner there and passes silently.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
scripts="${source_dir}/src/skills/dough-execute-plan/scripts"
calls="${temporary_dir}/gh-calls"
mkdir -p -- "${temporary_dir}/bin" "${temporary_dir}/unowned" "${temporary_dir}/owned"

# A `gh` with no login that logs each request and answers it as GitHub's
# workflow read.
cat > "${temporary_dir}/bin/gh" << GH
#!/bin/sh
[ "\$1" != auth ] || exit 1
printf '%s\n' "\$*" >> '${calls}'
printf 'HTTP/2.0 200 OK\r\n\r\n{"id":7001,"name":"CI","state":"active"}'
GH
chmod +x "${temporary_dir}/bin/gh"

# The installed diagnostic entry reading a workflow, as a check runs it.
ask="PATH='${temporary_dir}/bin':\"\${PATH}\" node '${scripts}/ci-github-diagnostic.mjs' workflow owner/repo"
printf '#!/usr/bin/env bash\n%s > /dev/null 2>&1 || true\n' "${ask}" \
  > "${temporary_dir}/unowned/asking.sh"
cat > "${temporary_dir}/owned/asking.sh" << CHECK
#!/usr/bin/env bash
set -euo pipefail
source '${source_dir}/tests/helpers/private-request-owner.bash'
enter_private_request_owner
${ask} > /dev/null
leave_private_request_owner
CHECK

# The runner is itself started with a root that admits no owner, so a runner
# that passed its own root on would not reach this machine's real owner.
printf -v inherited_root '%s/%0110d' "${temporary_dir}" 0
run_suite() {
  suite_status=0
  DOUGH_GITHUB_REQUEST_OWNER_ROOT="${inherited_root}" \
    OPEN_DOUGH_TEST_DIR="${temporary_dir}/$1" "${BASH}" "${source_dir}/scripts/test.sh" \
    > "${temporary_dir}/$1.log" 2>&1 || suite_status=$?
}

run_suite unowned
if ((suite_status != 1)); then
  printf 'FAIL: the runner exited %s for a check asking GitHub through no owner of its own, not 1.\n' \
    "${suite_status}" >&2
  cat -- "${temporary_dir}/unowned.log" >&2
  exit 1
fi
expect_in_log "${temporary_dir}/unowned.log" -F -x -- "FAIL: ${temporary_dir}/unowned/asking.sh"
expect_in_log "${temporary_dir}/unowned.log" -F -x -- \
  'Asked GitHub without a request owner root of its own.'
if [[ -e ${calls} ]]; then
  echo 'FAIL: a check with no request owner root of its own had its request asked:' >&2
  cat -- "${calls}" >&2
  exit 1
fi

run_suite owned
if ((suite_status != 0)) || [[ -s ${temporary_dir}/owned.log ]]; then
  printf 'FAIL: the runner exited %s or printed for a check with its own request owner root.\n' \
    "${suite_status}" >&2
  cat -- "${temporary_dir}/owned.log" >&2
  exit 1
fi
grep -q -x -F -- 'api --include repos/owner/repo/actions/workflows/ci.yml' "${calls}"

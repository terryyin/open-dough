#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
mkdir -p -- "${fixture}/tests" "${fixture}/scripts" "${temporary_dir}/bin"
cp -- "${source_dir}/scripts/test.sh" "${fixture}/scripts/"
markers="${temporary_dir}/markers"
mkdir -p -- "${markers}"
printf '#!/usr/bin/env bash\necho self-check-ran\ntouch -- %q\n' "${markers}/self-check" \
  > "${fixture}/scripts/check-self-installation.sh"
cat > "${fixture}/tests/assertion.sh" << 'TEST'
#!/usr/bin/env bash
set -euo pipefail
echo test-started
[[ a == b ]]
echo assertion-was-masked
TEST

# A portable unsupported child, even when the runner itself uses modern Bash.
cat > "${temporary_dir}/bin/bash" << 'OLD_BASH'
#!/bin/sh
if [ "$1" = -c ]; then
  printf '3.2.57(1)-release'
else
  echo unsupported-child-ran
fi
OLD_BASH
chmod +x "${temporary_dir}/bin/bash"
if PATH="${temporary_dir}/bin:${PATH}" "${BASH}" "${fixture}/scripts/test.sh" > "${temporary_dir}/old.log" 2>&1; then
  echo 'FAIL: the runner accepted unsupported child Bash.' >&2
  exit 1
fi
grep -F -- "${temporary_dir}/bin/bash (version 3.2.57(1)-release)" "${temporary_dir}/old.log"
grep -F -- 'put its bin directory first on PATH' "${temporary_dir}/old.log"
if grep -E -- 'test-started|self-check-ran|unsupported-child-ran' "${temporary_dir}/old.log"; then
  echo 'FAIL: unsupported Bash reached a suite check.' >&2
  exit 1
fi

# Use the real supported interpreter, including real set -e assertion behavior.
rm -- "${temporary_dir}/bin/bash"
ln -s "${BASH}" "${temporary_dir}/bin/bash"
if PATH="${temporary_dir}/bin:${PATH}" "${BASH}" "${fixture}/scripts/test.sh" > "${temporary_dir}/failed.log" 2>&1; then
  echo 'FAIL: the runner accepted a failing assertion.' >&2
  exit 1
fi
grep -F -- 'test-started' "${temporary_dir}/failed.log"
grep -F -- 'FAIL: tests/assertion.sh' "${temporary_dir}/failed.log"
if grep -F -- 'assertion-was-masked' "${temporary_dir}/failed.log"; then
  echo 'FAIL: Bash ignored the assertion failure.' >&2
  exit 1
fi

rm -f -- "${markers}"/*
printf '#!/usr/bin/env bash\nset -euo pipefail\n[[ a == a ]]\ntouch -- %q\n' \
  "${markers}/assertion" > "${fixture}/tests/assertion.sh"
# Output is hidden for passing checks, so markers prove both checks ran.
PATH="${temporary_dir}/bin:${PATH}" "${BASH}" "${fixture}/scripts/test.sh"
[[ -e ${markers}/assertion && -e ${markers}/self-check ]]
echo 'PASS: unsupported child Bash stops before checks; supported Bash propagates failed assertions and passes valid checks.'

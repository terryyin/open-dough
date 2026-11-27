#!/usr/bin/env bash
# The dashboard's synthetic `gh` CLI (dashboard/test-support/fixtures/fake-gh)
# ends on SIGTERM or SIGINT with status 143, records the signal, and retires
# its curl child and reply directory, including a signal that arrives while
# that directory is being created. It sends exact argv without curl
# configuration, proxies or Node, prints binary stdout, and answers auth
# locally before any PID setup. The real request owner, given the fake gh
# preload (dashboard/test-support/support/fakeGhPreload.mjs), answers API
# calls in process with the API executable poisoned: exact argv, no call PID,
# native execFile overloads and promisification kept, and its request bound
# ends a held call's HTTP request.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/wait-for.bash
source "${source_dir}/Distribution/tests/helpers/wait-for.bash"
fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}
temporary_dir=$(mktemp -d)
github_pid=
cleanup() {
  if [[ -n ${github_pid} ]]; then kill -KILL "${github_pid}" 2> /dev/null || true; fi
  rm -rf -- "${temporary_dir}"
}
trap cleanup EXIT
bin="${temporary_dir}/bin"
scratch="${temporary_dir}/scratch"
mkdir -p -- "${bin}" "${scratch}"
cp -- "${source_dir}/dashboard/test-support/fixtures/fake-gh" "${bin}/gh"
pidfile="${temporary_dir}/gh.pid"
arrivals="${temporary_dir}/arrivals"

# A local fake GitHub that records each request's argv, answers
# repos/test/answer* with a gh --include frame, holds every other request,
# and records a held request's connection closing.
node -e '
const { appendFileSync, writeFileSync } = require("node:fs");
const [log, port] = process.argv.slice(1);
const server = require("node:http").createServer((request, response) => {
  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => {
    const argv = Buffer.concat(chunks).toString().split("\0").slice(0, -1);
    appendFileSync(log, JSON.stringify(argv) + "\n");
    if (argv.includes("repos/test/answer-binary")) {
      response.end(Buffer.from([48, 10, 48, 10, 0, 1, 255, 195, 40, 10, 0]));
    } else if (argv.some((arg) => arg.startsWith("repos/test/answer"))) {
      response.end("0\n0\nHTTP/2.0 200 OK\r\nContent-Type: text/plain\r\n\r\nanswered");
    } else {
      response.on("close", () => appendFileSync(log, "closed\n"));
    }
  });
});
server.listen(0, "127.0.0.1", () => writeFileSync(port, String(server.address().port)));
' "${arrivals}" "${temporary_dir}/port" &
github_pid=$!
wait_for "the fake GitHub's port" 10 "[[ -s \"${temporary_dir}/port\" ]]"
origin="http://127.0.0.1:$(< "${temporary_dir}/port")/"

# Job control leaves INT deliverable to background commands.
set -m
start_gh() {
  rm -f -- "${pidfile}" "${pidfile}.exited"
  env TMPDIR="${scratch}" FAKE_GH_ORIGIN="${origin}" FAKE_GH_PIDFILE="${pidfile}" \
    PATH="${bin}:${PATH}" "${bin}/gh" api repos/test/repo > /dev/null 2>&1 &
  gh_pid=$!
}
expect_retired() {
  local signal=$1 status=0
  wait "${gh_pid}" || status=$?
  [[ ${status} -eq 143 ]] || fail "${signal} exited ${status}"
  [[ $(< "${pidfile}.exited") == "${signal}" ]] || fail "${signal} was not recorded"
  left=$(ls -A -- "${scratch}")
  [[ -z ${left} ]] || fail "${signal} left a reply directory"
}

for signal in SIGTERM SIGINT; do
  : > "${arrivals}"
  start_gh
  wait_for "the held request (${signal})" 10 "[[ -s \"${arrivals}\" ]]"
  children=$(pgrep -P "${gh_pid}" || true)
  [[ -n ${children} ]] || fail "no curl child under ${signal}"
  kill -s "${signal#SIG}" "${gh_pid}"
  expect_retired "${signal}"
  for child in ${children}; do
    ! kill -0 "${child}" 2> /dev/null || fail "${signal} left child ${child}"
  done
done

# A signal while mktemp still creates the reply directory retires it too.
release="${temporary_dir}/mktemp.release"
mkfifo -- "${release}"
cat > "${bin}/mktemp" << MKTEMP
#!/bin/sh
created=\$(/usr/bin/mktemp "\$@") || exit \$?
printf '%s\n' "\$created"
printf '%s' "\$\$" > '${temporary_dir}/mktemp.reached'
IFS= read -r released < '${release}'
MKTEMP
chmod +x "${bin}/mktemp"
start_gh
wait_for "mktemp to be held" 10 "[[ -s \"${temporary_dir}/mktemp.reached\" ]]"
creator=$(< "${temporary_dir}/mktemp.reached")
kill -s TERM "${gh_pid}"
printf 'released\n' > "${release}"
expect_retired SIGTERM
! kill -0 "${creator}" 2> /dev/null || fail "mktemp ${creator} survived"
# Later clients create their reply directory with the real mktemp.
rm -- "${bin}/mktemp"

# The real owner. Its API executable only marks that it was launched.
owner_bin="${temporary_dir}/owner-bin"
mkdir -p -- "${owner_bin}"
cat > "${owner_bin}/gh" << GH
#!/bin/sh
if [ "\$1" = api ]; then : > '${temporary_dir}/api-launched'; exit 99; fi
exec '${source_dir}/dashboard/test-support/fixtures/fake-gh' "\$@"
GH
chmod +x "${owner_bin}/gh"
preload="${source_dir}/dashboard/test-support/support/fakeGhPreload.mjs"
requests="${source_dir}/Distribution/src/skills/dough-execute-plan/scripts/github-requests.mjs"
owner_env=(env PATH="${owner_bin}:${PATH}" FAKE_GH_ORIGIN="${origin}"
  FAKE_GH_TRANSPORT=in-process GH_TOKEN=fixture-token TMPDIR="${scratch}"
  DOUGH_GITHUB_REQUEST_OWNER_ROOT="${temporary_dir}/owners"
  DOUGH_GITHUB_REQUEST_OWNER_IDLE_MS=100)
: > "${arrivals}"

# The preload inside a process named as the owner keeps native overloads and
# promisification, and its fake API promise carries no PID.
mkdir -p -- "${temporary_dir}/probe"
cat > "${temporary_dir}/probe/github-request-owner.mjs" << 'PROBE'
import { execFile } from "node:child_process";
import { promisify } from "node:util";
await new Promise((resolve, reject) =>
  execFile("/usr/bin/true", (error) => (error ? reject(error) : resolve())));
const auth = await promisify(execFile)("gh", ["auth", "token"]);
const api = promisify(execFile)("gh", ["api", "repos/test/answer-probe"], { encoding: "buffer" });
const answer = await api;
process.stdout.write(JSON.stringify([auth.stdout, answer.stdout.toString().endsWith("answered"), api.child.pid ?? null]));
PROBE
probed=$("${owner_env[@]}" node --import "${preload}" "${temporary_dir}/probe/github-request-owner.mjs")
[[ ${probed} == '["fixture-token",true,null]' ]] || fail "preload probe gave ${probed}"

# A consumer's real owner answers in process with exact argv, and its bound
# ends a held call.
read_result=$("${owner_env[@]}" NODE_OPTIONS="--import=${preload}" node --input-type=module -e '
const { GitHubRequests } = await import(process.argv[1]);
const requests = new GitHubRequests({ boundMs: 1000, backoffBaseMs: 1 });
const signal = () => new AbortController().signal;
const read = await requests.request(["api", "repos/test/answer/caf%C3%A9", "-H", "X: 終"], signal());
const bounded = await requests.request(["api", "repos/test/held"], signal()).then(() => "answered", (error) => error.reason);
requests.disconnect();
process.stdout.write(JSON.stringify([read.status, read.body, read.failure ?? null, bounded]));
' "${requests}")
[[ ${read_result} == '[200,"answered",null,{"kind":"timed-out"}]' ]] || fail "owner read gave ${read_result}"
grep -qxF '["api","--include","repos/test/answer/caf%C3%A9","-H","X: 終"]' "${arrivals}" || {
  cat -- "${arrivals}" >&2
  fail "owner argv differed"
}
wait_for "the bounded call's HTTP request to close" 10 "grep -qx closed \"${arrivals}\""
[[ ! -e ${temporary_dir}/api-launched ]] || fail "the API executable was launched"

# The shell client: exact argv and binary stdout, ignoring curl configuration
# and proxies and never starting Node; auth stays local before PID setup.
no_node="${temporary_dir}/no-node"
mkdir -p -- "${no_node}"
printf '#!/bin/sh\nexit 99\n' > "${no_node}/node"
chmod +x "${no_node}/node"
printf 'url = http://127.0.0.1:1\nfail\n' > "${temporary_dir}/.curlrc"
client_env=(env PATH="${no_node}:${bin}:${PATH}" HOME="${temporary_dir}" CURL_HOME="${temporary_dir}"
  TMPDIR="${scratch}" FAKE_GH_PIDFILE="${pidfile}" HTTP_PROXY=http://127.0.0.1:1
  http_proxy=http://127.0.0.1:1 ALL_PROXY=http://127.0.0.1:1 all_proxy=http://127.0.0.1:1)
rm -f -- "${pidfile}"
: > "${arrivals}"
"${client_env[@]}" FAKE_GH_ORIGIN="${origin}" "${bin}/gh" api repos/test/answer-binary "" $'quote"\\tab\tline\n終' \
  > "${temporary_dir}/binary.out"
printf '\000\001\377\303(\n\000' | cmp -s - "${temporary_dir}/binary.out" || fail "binary stdout differed"
grep -qxF '["api","repos/test/answer-binary","","quote\"\\tab\tline\n終"]' "${arrivals}" || {
  cat -- "${arrivals}" >&2
  fail "client argv differed"
}
[[ -s ${pidfile} ]] || fail "the client recorded no PID"
rm -f -- "${pidfile}"
token=$("${client_env[@]}" GH_TOKEN=$'local café\n終' "${bin}/gh" auth token)
[[ ${token} == $'local café\n終' ]] || fail "auth printed ${token}"
if "${client_env[@]}" GH_TOKEN= "${bin}/gh" auth token > "${temporary_dir}/empty.out"; then
  fail "an empty token succeeded"
fi
requests_seen=$(wc -l < "${arrivals}")
[[ ! -s ${temporary_dir}/empty.out && ! -e ${pidfile} && ${requests_seen} -eq 1 ]] || fail "auth left PID setup, output or a request"
left=$(ls -A -- "${scratch}")
[[ -z ${left} ]] || fail "the client left a reply directory"

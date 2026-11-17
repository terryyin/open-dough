import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  fixture,
  gateRef,
  git,
  launch,
  repository,
  succeeded,
  until,
} from "../support/local-test-suite-fixtures.mjs";

// The real container helper runs its entry through a Docker stand-in: the
// entry itself runs here with only the container's environment, `npm ci` is
// the dependency boundary, and the host's owner process is hidden as a PID
// namespace hides it. Git, the runner and admission stay real.
const source = fileURLToPath(new URL("../../../", import.meta.url));

function executable(file, text) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
  chmodSync(file, 0o755);
}

// The linked worktree as the diagnostic sees it: the real helper and its
// inputs, one probe check exiting `checkExit`, an empty evaluation directory
// and a passing stand-in for the unrelated self-installation check.
function diagnosticCheckout(linked, checkExit) {
  mkdirSync(path.join(linked, "Distribution/evaluation/tests"), {
    recursive: true,
  });
  copyFileSync(
    path.join(source, "scripts/ci-container.sh"),
    path.join(linked, "scripts/ci-container.sh"),
  );
  copyFileSync(
    path.join(source, ".node-version"),
    path.join(linked, ".node-version"),
  );
  writeFileSync(path.join(linked, "package-lock.json"), "{}\n");
  executable(
    path.join(linked, "scripts/check-self-installation.sh"),
    "#!/usr/bin/env bash\n",
  );
  executable(
    path.join(linked, "Distribution/tests/probe/probe.sh"),
    `#!/usr/bin/env bash\ntouch "$(dirname "$0")/ran"\nexit ${checkExit}\n`,
  );
}

function containerRuntime(root, hiddenPid) {
  const bin = path.join(root, "runtime");
  const inside = path.join(root, "container-bin");
  const realPs = spawnSync("bash", ["-c", "command -v ps"], {
    encoding: "utf8",
  }).stdout.trim();
  executable(
    path.join(inside, "ps"),
    `#!/usr/bin/env bash
if [[ \${1:-} == -p && \${2:-} == ${hiddenPid} ]]; then exit 1; fi
exec ${realPs} "$@"
`,
  );
  executable(path.join(inside, "npm"), "#!/usr/bin/env bash\n");
  executable(
    path.join(bin, "docker"),
    `#!/usr/bin/env bash
set -euo pipefail
case $1 in
  info | image) exit 0 ;;
esac
shift
environment=() workdir=/
while (($#)); do
  case $1 in
    --rm | --init | --interactive | --tty) shift ;;
    --user | --volume) shift 2 ;;
    --workdir) workdir=$2 && shift 2 ;;
    --env) environment+=("\${2/#HOME=*/HOME=${root}/container-home}") && shift 2 ;;
    *) break ;;
  esac
done
shift
[[ $1 == bash ]] || exit 0
cd -- "$workdir"
exec env -i "PATH=${inside}:$PATH" "\${environment[@]}" "$@"
`,
  );
  return bin;
}

function diagnostic(t, linked, runtime, args) {
  return launch(
    t,
    linked,
    ["scripts/ci-container.sh", ...args],
    { PATH: `${runtime}:${process.env.PATH}` },
    "bash",
  );
}

for (const { name, checkExit, args, expected } of [
  { name: "passing pathless", checkExit: 0, args: [], expected: 0 },
  { name: "failing pathless", checkExit: 7, args: [], expected: 1 },
  {
    name: "selected",
    checkExit: 0,
    args: ["Distribution/tests/probe/probe.sh"],
    expected: 0,
  },
]) {
  test(`a ${name} container diagnostic keeps the host's suite admission`, async (t) => {
    const { root, project, linked, observe } = await fixture(t);
    const hostObservation = observe("host");
    const host = repository(t, project, hostObservation);
    await until("host suite admitted", () =>
      existsSync(path.join(hostObservation, "start-0")),
    );
    const owner = git(project, "rev-parse", gateRef);
    const hostPid = JSON.parse(git(project, "cat-file", "blob", owner)).pid;
    diagnosticCheckout(linked, checkExit);

    const result = await diagnostic(
      t,
      linked,
      containerRuntime(root, hostPid),
      args,
    ).result;

    assert.equal(result.code, expected, result.output);
    assert.ok(
      existsSync(path.join(linked, "Distribution/tests/probe/ran")),
      result.output,
    );
    assert.equal(git(project, "rev-parse", gateRef), owner, result.output);
    writeFileSync(path.join(hostObservation, "release"), "");
    await succeeded(host);
    assert.equal(
      spawnSync("git", [
        "-C",
        project,
        "rev-parse",
        "--verify",
        "--quiet",
        gateRef,
      ]).status,
      1,
    );
  });
}

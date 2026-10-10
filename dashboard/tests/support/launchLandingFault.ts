// An external Git fault seam for any launch's landing: a `git` first on PATH
// that counts pushes, can lose one accepted push response, and can fail one
// pin cleanup.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { quote } from "./completionRecovery.ts";

export function landingGitFault(machine: string) {
  const actual = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  const bin = path.join(machine, "landing-git-bin");
  mkdirSync(bin);
  const pushes = path.join(machine, "landing-pushes");
  const losePush = path.join(machine, "landing-lose-push");
  const failCleanup = path.join(machine, "landing-fail-cleanup");
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh
if [ "$1" = push ]; then
 printf 'push\\n' >> ${quote(pushes)}
 if [ -f ${quote(losePush)} ]; then
  rm ${quote(losePush)}
  ${quote(actual)} "$@" || exit $?
  echo 'Accepted push response lost' >&2
  exit 74
 fi
fi
if [ "$1" = update-ref ] && [ "$2" = -d ] && [ -f ${quote(failCleanup)} ]; then
 rm ${quote(failCleanup)}
 echo 'Injected pin cleanup EIO' >&2
 exit 74
fi
exec ${quote(actual)} "$@"
`,
    { mode: 0o755 },
  );
  return {
    env: { ...process.env, PATH: `${bin}:${process.env["PATH"] ?? ""}` },
    losePush: () => {
      writeFileSync(losePush, "lose\n");
    },
    failCleanup: () => {
      writeFileSync(failCleanup, "fail\n");
    },
    pushes: () => {
      try {
        return readFileSync(pushes, "utf8").trim().split("\n").length;
      } catch {
        return 0;
      }
    },
  };
}

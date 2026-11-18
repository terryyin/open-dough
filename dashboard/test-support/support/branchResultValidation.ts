import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { quote } from "./completionRecovery.ts";
import { test as base } from "./preparationPage.ts";
export { expect } from "./preparationPage.ts";

// Holds the first ancestry validation after the comparison has fixed its tree.
function holdValidation(machine: string) {
  const bin = path.join(machine, "branch-validation-bin");
  const hold = path.join(bin, "hold");
  const held = path.join(bin, "held");
  const released = path.join(bin, "released");
  const fail = path.join(bin, "fail");
  const failed = path.join(bin, "failed");
  const actual = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  mkdirSync(bin);
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh
if [ "$1" = merge-base ] && [ "$2" = --is-ancestor ] && [ -f ${quote(hold)} ] && mkdir ${quote(path.join(bin, "claimed"))} 2>/dev/null; then
  touch ${quote(held)}
  while [ ! -e ${quote(released)} ] && [ -d ${quote(bin)} ]; do sleep 0.1; done
fi
if [ "$1" = merge-base ] && [ "$2" = --is-ancestor ] && [ -f ${quote(fail)} ] && [ "$3" = "$(cat ${quote(fail)})" ] && mkdir ${quote(failed)} 2>/dev/null; then
  exit 128
fi
exec ${quote(actual)} "$@"
`,
    { mode: 0o755 },
  );
  return {
    bin,
    hold: () => {
      writeFileSync(hold, "");
    },
    held: () => existsSync(held),
    failOnceFor: (tip: string) => {
      writeFileSync(fail, tip);
    },
    failed: () => existsSync(failed),
    release: () => {
      writeFileSync(released, "");
    },
  };
}

export const test = base.extend<{
  validation: ReturnType<typeof holdValidation>;
}>({
  validation: async ({ origin }, use) => {
    const control = holdValidation(origin.machine);
    try {
      await use(control);
    } finally {
      control.release();
    }
  },
  pathPrefix: async ({ validation }, use) => {
    await use([validation.bin]);
  },
});

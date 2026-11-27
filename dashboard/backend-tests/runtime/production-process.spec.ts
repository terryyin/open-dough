// Production process ownership (../../server/productionProcess.mjs): stopping
// a build or preview signals its whole process group and succeeds once the
// group has no live member. Real spawn and group kill are proven by
// e2e/runtime/production-watcher.spec.ts (SIGHUP ends production).
import { expect, test } from "vitest";
import { signalProcessGroup } from "../../server/productionProcess.mjs";

// A `ps -axo pgid=,stat=` reading: one line per process.
const psReading = (...members: [pgid: number, stat: string][]) =>
  members.map(([pgid, stat]) => `  ${pgid} ${stat}`).join("\n");
const refused = (code: string) => () => {
  throw Object.assign(new Error(code), { code });
};
// "stopped", or the error code the stop propagated.
const stopOutcome = (stop: () => void) => {
  try {
    stop();
    return "stopped";
  } catch (error) {
    return (error as NodeJS.ErrnoException).code;
  }
};

test("stopping a process group succeeds only once no member is live", () => {
  const groups = [
    {
      group: "already gone",
      ended: false,
      refusal: "ESRCH",
      reading: undefined,
      outcome: "stopped",
    },
    {
      group: "only an unreaped member",
      ended: true,
      refusal: "EPERM",
      reading: psReading([700, "Z"]),
      outcome: "stopped",
    },
    {
      group: "an exiting member",
      ended: true,
      refusal: "EPERM",
      reading: psReading([700, "?NE"]),
      outcome: "stopped",
    },
    {
      group: "only other groups' live members",
      ended: true,
      refusal: "EPERM",
      reading: psReading([701, "S"]),
      outcome: "stopped",
    },
    {
      group: "a live member beside an unreaped one",
      ended: true,
      refusal: "EPERM",
      reading: psReading([700, "Z"], [700, "S+"]),
      outcome: "EPERM",
    },
    {
      group: "an unreadable process list",
      ended: true,
      refusal: "EPERM",
      reading: undefined,
      outcome: "EPERM",
    },
    {
      group: "the owned child still running",
      ended: false,
      refusal: "EPERM",
      reading: psReading([700, "Z"]),
      outcome: "EPERM",
    },
  ];
  for (const { group, ended, refusal, reading, outcome } of groups) {
    expect(
      stopOutcome(() => {
        signalProcessGroup({
          pgid: 700,
          ended,
          signal: "SIGTERM",
          kill: refused(refusal),
          readGroups: () => reading,
        });
      }),
      group,
    ).toBe(outcome);
  }
});

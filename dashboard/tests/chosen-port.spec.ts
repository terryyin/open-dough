// A Vite start that asked for any free port and lost Vite's own choice to
// another listener starts again (../server/chosenPort.mjs); every other
// failure, and any failure on a named port, stands.
import { expect, test } from "./support/pageTest.ts";
import { startOnChosenPort } from "../server/chosenPort.mjs";

const lost = (port: number) =>
  new Error(`could not start:\nError: Port ${String(port)} is already in use`);

// Each attempt launches, ends its launch, then settles with the next outcome.
function launches(outcomes: readonly (Error | string)[]) {
  const log: string[] = [];
  let attempt = 0;
  const start = async () => {
    const outcome = outcomes[attempt++];
    if (outcome === undefined) throw new Error("No further outcome");
    log.push(`launch ${String(attempt)}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (typeof outcome === "string") return outcome;
    log.push(`end ${String(attempt)}`);
    throw outcome;
  };
  return { log, start };
}

test("a start on any port that lost Vite's choice starts again after ending that launch", async () => {
  for (const port of [0, undefined]) {
    const { log, start } = launches([lost(40001), "http://127.0.0.1:40002"]);
    expect(await startOnChosenPort(port, start)).toBe("http://127.0.0.1:40002");
    expect(log).toEqual(["launch 1", "end 1", "launch 2"]);
  }
});

test("a named port that is already in use fails at once", async () => {
  const failure = lost(4173);
  const { log, start } = launches([failure, "unused"]);
  await expect(startOnChosenPort(4173, start)).rejects.toBe(failure);
  expect(log).toEqual(["launch 1", "end 1"]);
});

test("any other failure on any port fails at once", async () => {
  const failure = new Error(
    "Vite exited (code 1) before reporting its address",
  );
  const { log, start } = launches([failure, "unused"]);
  await expect(startOnChosenPort(0, start)).rejects.toBe(failure);
  expect(log).toEqual(["launch 1", "end 1"]);
});

test("a third lost choice fails with that attempt's error", async () => {
  const third = lost(40003);
  const { log, start } = launches([lost(40001), lost(40002), third, "unused"]);
  await expect(startOnChosenPort(undefined, start)).rejects.toBe(third);
  expect(log).toEqual([
    "launch 1",
    "end 1",
    "launch 2",
    "end 2",
    "launch 3",
    "end 3",
  ]);
});

import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { stoppedBodyMarker } from "./stoppedBody.ts";

test("finishes before the stopped test", () => {
  expect(1 + 1).toBe(2);
});

// Stopped by the run's deadline or a signal within its default case timeout.
test("is still running when stopped", async () => {
  const configFile = test.info().config.configFile;
  if (configFile === undefined) throw new Error("The proof run has no config");
  writeFileSync(stoppedBodyMarker(configFile), "");
  await new Promise(() => {});
});

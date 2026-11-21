// The Done capture case's clock and the machine-store effects its tests
// perform: keeping records, dated checkout work and the Done mark.
// Times are minutes before the case's clock: Done at 10 by default.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished, vi } from "vitest";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { performCheckoutWork } from "../../../Distribution/tests/support/repository-checkout-work.mjs";
import type { CheckoutWorkBuilder } from "../../../Distribution/tests/support/repositoryCheckoutWorkTestData.mjs";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

export const source = "open-dough";

export { minutesAgo };

import type { Checkout } from "./doneCaptureCaseMaterialization.ts";

export type { Checkout };

// Keeps these records as the project's whole store in a private machine
// home, and answers the home.
export function keep(...records: LaunchRecord[]) {
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-capture-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  keepLaunchStore(home, { [source]: records });
  return home;
}

// The record the store now keeps for the session `sessionId`.
export const keptRecordOf = async (sessionId: string) =>
  (await keptRecords(source)).find(
    (kept) => kept.session.sessionId === sessionId,
  );

export const work = <Name extends string>(
  checkout: Checkout,
  steps: CheckoutWorkBuilder<Name>,
) => performCheckoutWork(checkout, steps.please());

export const markDone = (record: LaunchRecord, at = minutesAgo(10)) =>
  setRecordDoneAt(source, record.session, at);

// A Done whose branch capture, once read, waits until released before
// answering its result.
export function aHeldDone(record: LaunchRecord, at = minutesAgo(10)) {
  let release!: () => void;
  let reached!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const reading = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const marking = setRecordDoneAt(source, record.session, at, {
    capture: async (candidate, doneAt) => {
      const read = await captureBranchResult(candidate, doneAt);
      reached();
      await held;
      return read;
    },
  });
  return { reading, release, marking };
}

export const undoDone = (record: LaunchRecord) =>
  setRecordDoneAt(source, record.session, undefined);

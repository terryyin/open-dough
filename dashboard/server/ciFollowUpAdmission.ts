// Receipt eligibility and atomic allowance consumption, under the ledger lock.
import { leaveMachineJson } from "./machineJsonStore.ts";
import type { LandingReference } from "./landedCiHistoryStore.ts";
import type { LaunchLanding } from "../src/launchLanding.ts";
import {
  changeFollowUps,
  followUpKey,
  type RepeatRequest,
} from "./ciFollowUpStore.ts";

// Called only while creating a new immutable receipt, before its launch write:
// recording the receipt here makes this machine the one that follows it up.
// A failed ledger never breaks landing capture; it simply grants no eligibility.
export async function registerFollowUpReceipt(
  project: string,
  landing: LaunchLanding,
): Promise<void> {
  try {
    await changeFollowUps((ledger) => {
      const key = followUpKey(project, landing);
      const previous = ledger.landings[key];
      if (previous?.receipts.includes(landing.receipt)) return leaveMachineJson;
      return {
        ...ledger,
        landings: {
          ...ledger.landings,
          [key]:
            previous === undefined
              ? {
                  project,
                  revision: landing.revision,
                  target: landing.target,
                  receipts: [landing.receipt],
                  ...(landing.identity === undefined
                    ? {}
                    : { identity: landing.identity }),
                  eligible: true,
                  capture: landing,
                }
              : {
                  ...previous,
                  receipts: [...previous.receipts, landing.receipt],
                },
        },
      };
    });
  } catch {
    /* An unreadable ledger admits nothing. */
  }
}

export async function spendRepeat(
  project: string,
  landing: LandingReference,
  request: RepeatRequest,
): Promise<boolean> {
  let spent = false;
  await changeFollowUps((ledger) => {
    const key = followUpKey(project, landing);
    const admitted = ledger.landings[key];
    if (
      admitted?.eligible !== true ||
      !admitted.receipts.includes(landing.receipt) ||
      admitted.request !== undefined
    )
      return leaveMachineJson;
    spent = true;
    return {
      ...ledger,
      landings: { ...ledger.landings, [key]: { ...admitted, request } },
    };
  });
  return spent;
}

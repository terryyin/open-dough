// Receipt eligibility and atomic allowance consumption, under the ledger lock.
import { hostname } from "node:os";
import { leaveMachineJson } from "./machineJsonStore.ts";
import type { LandingReference } from "./landedCiHistoryStore.ts";
import type { LaunchLanding } from "../src/launchLanding.ts";
import {
  changeFollowUps,
  followUpKey,
  hasRepeatAuthority,
  type RepeatRequest,
} from "./ciFollowUpStore.ts";

// Called only while creating a new immutable receipt, before its launch write.
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
                  eligible: hasRepeatAuthority(ledger, project),
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
    /* Unreadable authority admits nothing. */
  }
}

export async function saveFollowUpSetting(
  project: string,
  enabled: boolean,
  previous: readonly LandingReference[],
): Promise<void> {
  await changeFollowUps((ledger) => {
    const landings = { ...ledger.landings };
    if (!enabled || ledger.projects[project]?.enabled !== true) {
      for (const [key, landing] of Object.entries(landings))
        if (landing.project === project && landing.request === undefined)
          landings[key] = { ...landing, eligible: false };
    }
    for (const landing of previous) {
      const key = followUpKey(project, landing);
      // Receipts which predate this boundary never gain eligibility on re-enable.
      landings[key] ??= {
        project,
        revision: landing.revision,
        target: landing.target ?? "",
        receipts: [landing.receipt],
        eligible: false,
      };
    }
    return {
      ...ledger,
      landings,
      projects: {
        ...ledger.projects,
        [project]: { enabled, authority: hostname() },
      },
    };
  });
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
      !hasRepeatAuthority(ledger, project) ||
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

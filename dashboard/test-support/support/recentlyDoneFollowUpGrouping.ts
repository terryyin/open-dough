// Frontend fixtures for ad hoc story follow-ups on Recently done
// (`../../frontend-tests/sessions/follow-up-source-navigation.spec.ts`): a named
// source story, a builder for its open story follow-ups, and a Board opened on
// substituted machine answers. Catalogued done records for that
// source are `./followUpSourceCatalog.ts`.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { expect } from "./frontendApp.ts";
import {
  frontendRevision,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

export const sourceStory = {
  identity: "SEED-390#probe-follow-up-source",
  title: "Explain the CI pause",
};

// An open follow-up of the story `identity`, the source story by default.
export function storyFollowUp(
  title: string,
  sessionId: string,
  { identity = sourceStory.identity }: { readonly identity?: string } = {},
): LaunchRecord {
  return makeMe.aLaunchRecord
    .adHoc({
      instruction: title,
      title,
      followUp: makeMe.aFollowUp.ofStory(identity, frontendRevision).please(),
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .completedWith({ message: "" })
    .please();
}

// Opens the Board on a machine answer observing the open `records`.
export async function openBoard(
  page: Page,
  services: FrontendServiceState,
  records: readonly LaunchRecord[],
) {
  services.answerMachine(
    makeMe.aMachineAnswer.observingOpen(...records).please(),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
}

// Project CI on Intent's homepage (../../src/IntentCiStatus.tsx,
// ../../src/IntentPage.tsx) stays readable while Intent locations load, fail
// and recover through Retry, without another CI read. The homepage itself:
// ./intent-ci-status-homepage.spec.ts.

import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import { filesColumnVisible, workOf } from "./intent-ci-homepage-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  heldRead,
  inertCiReads,
  judgedStatus,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import { activateButton } from "../page-objects/activateButton.ts";

const passed = "Passed at a1b2c3d (Add login)";

// Counts CI reads; the first locations read is held until the case settles
// it, later ones answer one configured location.
function recoveringReads() {
  const ciReads = { fresh: 0, kept: 0 };
  const initialLocations = heldRead<IntentLocations>();
  const configured = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at("dashboard/tests")
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting("dashboard/tests/browse.spec.ts")
        .please(),
    )
    .please();
  const reads = {
    intent: makeMe.anIntentReadSource
      .reading({
        readLocations: () =>
          initialLocations.asked()
            ? Promise.resolve(configured)
            : initialLocations.ask(),
        readFile: () => Promise.resolve(""),
        readCandidates: () => Promise.resolve({ status: "absent" as const }),
      })
      .please(),
    ci: inertCiReads({
      readKeptStatus: () => {
        ciReads.kept += 1;
        return Promise.resolve({ none: true });
      },
      readStatus: () => {
        ciReads.fresh += 1;
        return Promise.resolve(
          judgedStatus("main", "pass", "a1b2c3d", "Add login"),
        );
      },
    }),
  };
  return { ciReads, initialLocations, reads };
}

test("project CI remains readable while locations load, fail and recover without another CI read", async () => {
  const { ciReads, initialLocations, reads } = recoveringReads();
  await mountIntentCiPage({ work: workOf(openDoughSource, "d4d4d4d"), reads });
  const ci = intentCiStatus();
  await expect
    .element(
      page.getByRole("heading", { name: "No story selected", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(page.getByText("Reading Intent locations…", { exact: true }))
    .toBeVisible();
  await ci.answers(passed);
  expect(initialLocations.asked()).toBe(true);
  expect(ciReads).toEqual({ fresh: 1, kept: 1 });

  initialLocations.reject(new Error("Read refused"));
  const failure = page.getByRole("alert");
  await expect
    .element(failure)
    .toHaveTextContent(
      "Intent locations for Open Dough could not be read. Retry",
    );
  await ci.answers(passed);

  await activateButton(
    failure.getByRole("button", { name: "Retry", exact: true }),
  );
  await expect.poll(filesColumnVisible).toBe(true);
  await expect.element(failure).not.toBeInTheDocument();
  await ci.answers(passed);
  expect(ciReads).toEqual({ fresh: 1, kept: 1 });
});

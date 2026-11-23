// One spec nested in a folder under its configured Intent location, the reads
// that serve it, and the Files column control the CI activation cases read it
// through.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { expandLocationAndFolders } from "./intent-ci-homepage-page.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

// Nested in a folder the reader opens under its location.
export const browsed = "dashboard/tests/nested/browse.spec.ts";
const configuredLocations: IntentLocations = {
  status: "configured",
  locations: [
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting(browsed)
      .please(),
  ],
};

// Intent's reads of the browsed spec, recording each file read's path and
// revision.
export function intentReadsRecording(fileReads: string[]): IntentReadSource {
  return {
    readLocations: () => Promise.resolve(configuredLocations),
    readFile: (...[, path, revision]) => {
      fileReads.push(`${path}@${revision}`);
      return Promise.resolve(`import { test } from "vitest";\n`);
    },
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
}

const intent = page.getByRole("main", { name: "Intent", exact: true });
// The browsed spec's control, named by its path after any change kind.
export const fileControl = () =>
  intent.getByRole("button", {
    name: new RegExp(`(^|\\s)${browsed.replaceAll(".", "\\.")}(,|$)`),
  });
export const purpose = intent.getByRole("region", {
  name: "Purpose",
  exact: true,
});

export async function selectBrowsedFile() {
  await expandLocationAndFolders("dashboard/tests");
  await userEvent.click(fileControl());
  await expectFileRead();
}

export async function expectFileRead() {
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "true");
  await expect.element(purpose).toBeVisible();
  await intentCiStatus().isAbsent();
}

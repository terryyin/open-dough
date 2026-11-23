import { expect, vi } from "vitest";
import { page, type Locator } from "vitest/browser";
import type { AdHocLaunches } from "../../src/StartSession.tsx";
import type { SessionPolicyOffer } from "../../src/launchOffers.ts";
import { focusStops } from "../navigation/board-accessibility.ts";

export const startSession = (project: string) =>
  page.getByRole("button", { name: `Start session in ${project}` });

export const launchDialog = (name?: string) => {
  const dialog = page.getByRole(
    "dialog",
    name === undefined ? undefined : { name },
  );
  return {
    dialog,
    instruction: dialog.getByRole("textbox"),
    command: dialog.getByText("Command details", { exact: true }),
    options: dialog.getByText(/^Refinement options/),
    start: dialog.getByRole("button", { name: "Start", exact: true }),
    cancel: dialog.getByRole("button", { name: "Cancel", exact: true }),
    host: dialog.getByRole("combobox", { name: "Host" }),
    model: dialog.getByRole("combobox", { name: "Model" }),
    effort: dialog.getByRole("combobox", { name: "Reasoning effort" }),
  };
};

export function adHocLaunches(offer: SessionPolicyOffer = "unavailable") {
  return {
    adHocAttemptOf: vi.fn<AdHocLaunches["adHocAttemptOf"]>(),
    rereadOffers: vi.fn<AdHocLaunches["rereadOffers"]>(),
    sessionPolicyOffer: () => offer,
    startAdHoc: vi.fn<AdHocLaunches["startAdHoc"]>().mockResolvedValue(true),
  };
}

export async function followsTabOrder(controls: readonly Locator[]) {
  const expected = controls.map((control) => control.element());
  const reached = await focusStops("{Tab}".repeat(expected.length));
  expect(reached).toHaveLength(expected.length);
  reached.forEach(({ element }, index) => {
    expect(element).toBe(expected[index]);
  });
  const last = controls.at(-1);
  if (last !== undefined) await expect.element(last).toHaveFocus();
}

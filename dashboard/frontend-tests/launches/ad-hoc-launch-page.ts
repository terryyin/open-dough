import { expect, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import type { AdHocLaunches } from "../../src/StartSession.tsx";
import type { SessionPolicyOffer } from "../../src/launchOffers.ts";

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
  for (const control of controls) {
    await userEvent.tab();
    await expect.element(control).toHaveFocus();
  }
}

// Colocated page object for Intent's CI status region.
import { expect } from "vitest";
import { page } from "vitest/browser";
import { ciReadingText } from "./intent-attempt-proof-page.ts";

export {
  intentCiProof,
  type ExpectedProofRow,
} from "./intent-attempt-proof-page.ts";
import { activateButton } from "../page-objects/activateButton.ts";

// The nearest ancestor of `element` that scrolls its content when it
// overflows.
function scrollRegionOf(element: Element): HTMLElement | null {
  for (let at = element.parentElement; at !== null; at = at.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(at).overflowY)) return at;
  }
  return null;
}

export function intentCiStatus() {
  const panel = page.getByRole("region", { name: "CI status", exact: true });
  const status = panel.getByRole("status");
  const alert = panel.getByRole("alert");
  const checkAgainButton = panel.getByRole("button", {
    name: "Check again",
    exact: true,
  });
  const stateElement = () =>
    panel.query()?.querySelector<HTMLElement>(".intent-ci-state") ?? null;
  const checkingElement = () =>
    panel.query()?.querySelector<HTMLElement>(".intent-ci-checking") ?? null;
  const checkedTimeElement = () =>
    panel.query()?.querySelector<HTMLTimeElement>("time") ?? null;

  const ci = {
    panel,
    status,
    alert,
    checkAgainButton,
    // Intent fills the page body's scroll region without overflowing it,
    // and CI status overflows a pane inside Intent that scrolls it.
    scrollsWithinIntent() {
      const intent = page
        .getByRole("main", { name: "Intent", exact: true })
        .query();
      const shown = panel.query();
      if (intent === null || shown === null) return false;
      const body = scrollRegionOf(intent);
      const pane = scrollRegionOf(shown);
      return (
        body !== null &&
        body.scrollHeight <= body.clientHeight &&
        pane !== null &&
        intent.contains(pane) &&
        pane.scrollHeight > pane.clientHeight
      );
    },
    async isAbsent() {
      await expect.element(panel).not.toBeInTheDocument();
      return ci;
    },
    async judges(branch: string) {
      await expect
        .element(
          panel.getByRole("heading", {
            name: `CI status of ${branch}`,
            exact: true,
          }),
        )
        .toBeVisible();
      return ci;
    },
    notes: (expected: string) =>
      expect
        .poll(() =>
          ciReadingText(
            panel.query()?.querySelector(".intent-ci-story")?.textContent,
          ),
        )
        .toBe(expected),
    async answers(expected: string) {
      await expect
        .poll(() => ciReadingText(stateElement()?.textContent))
        .toBe(expected);
      return ci;
    },
    async showsChecked(): Promise<string> {
      await expect
        .poll(() => ciReadingText(status.query()?.textContent))
        .toMatch(/^Checked at /);
      const checkedAt = checkedTimeElement()?.getAttribute("datetime") ?? "";
      expect(checkedAt).toMatch(/^\d{4}-\d\d-\d\dT/);
      return checkedAt;
    },
    async showsOnlyChecking(branch: string) {
      await expect
        .poll(() => ciReadingText(status.query()?.textContent))
        .toBe(`Checking the CI of ${branch}…`);
      expect(checkingElement()?.checkVisibility()).toBe(true);
      expect(stateElement()).toBeNull();
      expect(panel.query()?.textContent ?? "").not.toContain(
        "Previously retrieved",
      );
      return ci;
    },
    async showsKept(expected: {
      readonly state: string;
      readonly checking: string;
      readonly checkedAt?: string;
    }) {
      await ci.answers(expected.state);
      await expect
        .poll(() => ciReadingText(status.query()?.textContent))
        .toContain("Previously retrieved at");
      if (expected.checkedAt !== undefined) {
        await expect
          .poll(() => checkedTimeElement()?.getAttribute("datetime"))
          .toBe(expected.checkedAt);
      }
      await expect
        .poll(() => ciReadingText(checkingElement()?.textContent))
        .toBe(expected.checking);
      expect(checkingElement()?.checkVisibility()).toBe(true);
      return ci;
    },
    async showsNoPreviousOrSpinner() {
      await expect.poll(() => checkingElement()).toBeNull();
      expect(ciReadingText(status.query()?.textContent)).not.toContain(
        "Previously retrieved",
      );
      return ci;
    },
    async checkAgain() {
      await activateButton(checkAgainButton);
      return ci;
    },
  };
  return ci;
}

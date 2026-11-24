import type { Page } from "@playwright/test";
import { expect } from "../../dashboard/test-support/support/pageTest.ts";
import { expectProjectChoice } from "../../dashboard/test-support/dashboardPage.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";

function visibilityOn(page: Page) {
  return {
    async showsProject(label: string, address: string) {
      await expectProjectChoice(page, label);
      await expect(page).toHaveURL(address);
    },
    async showsAllHidden(address: string) {
      await expect(
        page.getByRole("heading", {
          name: "All projects are hidden",
          exact: true,
        }),
      ).toBeVisible();
      await expect(page).toHaveURL(address);
    },
  };
}

export function projectVisibilityPage(page: Page) {
  return {
    async openSeparateTab() {
      const tab = await page.context().newPage();
      return {
        async openProjectLink(address: string) {
          await openUntilRead(tab, address);
          return visibilityOn(tab);
        },
        close: () => tab.close(),
      };
    },
    async openLink(address: string) {
      await page.goto(address);
      return visibilityOn(page);
    },
  };
}

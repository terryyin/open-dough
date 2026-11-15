// The logo connection signal and return actions, separate from independent
// network holds and request evidence in the calling journey.
import { expect, type Page } from "@playwright/test";

export class ConnectionMark {
  constructor(readonly page: Page) {}
  mark() {
    return this.page.getByRole("banner").locator(".product-mark");
  }
  async shows(state: "awaiting" | "connected" | "disconnected") {
    const labels = {
      awaiting: "awaiting updates since return",
      connected: "updates received since return",
      disconnected: "disconnected",
    };
    await expect(
      this.page.getByRole("img", {
        name: `Dashboard connection: ${labels[state]}`,
        exact: true,
      }),
    ).toHaveCount(1);
    const colors = {
      awaiting: "234, 179, 8",
      connected: "34, 197, 94",
      disconnected: "239, 68, 68",
    };
    await expect(this.mark()).toHaveCSS("filter", new RegExp(colors[state]));
  }
  async returnFocus() {
    await this.page.evaluate(() => {
      window.dispatchEvent(new Event("blur"));
      window.dispatchEvent(new Event("focus"));
    });
  }
  async focusSettings() {
    await this.page
      .getByRole("button", { name: "System settings", exact: true })
      .focus();
  }
  async keepsFocus() {
    await expect(
      this.page.getByRole("button", { name: "System settings", exact: true }),
    ).toBeFocused();
  }
  async capture(state: string) {
    await this.page
      .getByRole("button", { name: "Sessions", exact: true })
      .screenshot({ path: `/tmp/seed372-logo-${state}.png` });
  }
}

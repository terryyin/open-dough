// A session entry's message part, on a card or in Recent sessions: its
// heading, the disclosure button named by the report's completion label, its
// message text, and its Mark as read.

import { expect, type Locator } from "@playwright/test";

export function messagePartOf(entry: Locator) {
  const part = entry.locator(".session-attention-message");
  return {
    part,
    heading: part.locator(".session-attention-heading"),
    text: part.getByRole("region", { name: "Attention message" }),
    markRead: part.getByRole("button", { name: "Mark as read" }),
  };
}
export type MessagePart = ReturnType<typeof messagePartOf>;

export async function expectExpanded(
  message: MessagePart,
  label: string,
  text: string,
): Promise<void> {
  await expect(message.heading).toHaveAccessibleName(label);
  await expect(message.heading).toHaveAttribute("aria-expanded", "true");
  await expect(message.text).toBeVisible();
  await expect(message.text).toHaveText(text);
}

export async function expectCollapsed(
  message: MessagePart,
  label: string,
): Promise<void> {
  await expect(message.heading).toHaveAccessibleName(label);
  await expect(message.heading).toHaveAttribute("aria-expanded", "false");
  await expect(message.text).toHaveCount(0);
  await expect(message.markRead).toHaveCount(0);
}

// The guard against Mark as read turning into another control: remembers each
// of the entry's buttons with its name, and later answers the names of the
// buttons that are new or renamed since.
type ButtonsSeen = { buttonsSeen?: Map<Element, string> };
export async function rememberButtons(entry: Locator): Promise<void> {
  await entry.evaluate((element) => {
    const name = (button: Element) =>
      button.getAttribute("aria-label") ?? button.textContent;
    (window as ButtonsSeen).buttonsSeen = new Map(
      [...element.querySelectorAll("button")].map((button) => [
        button,
        name(button),
      ]),
    );
  });
}
export async function buttonsAddedSince(entry: Locator): Promise<string[]> {
  return entry.evaluate((element) => {
    const name = (button: Element) =>
      button.getAttribute("aria-label") ?? button.textContent;
    const seen = (window as ButtonsSeen).buttonsSeen ?? new Map();
    return [...element.querySelectorAll("button")]
      .filter((button) => seen.get(button) !== name(button))
      .map(name);
  });
}

// How far the message text's box scrolls: its visible and whole heights, and
// how far down it is scrolled.
export function scrollOf(message: MessagePart) {
  return message.text.evaluate((text) => ({
    shown: text.clientHeight,
    whole: text.scrollHeight,
    top: text.scrollTop,
  }));
}

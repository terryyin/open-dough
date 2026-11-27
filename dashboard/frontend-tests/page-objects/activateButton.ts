// Activates a visible control in the page, without the frame-bound waits of
// trusted pointer input. It first yields one task so pending renders commit;
// the yield also passes under fake timers, which leave MessageChannel real.
import { expect } from "vitest";
import type { Locator } from "vitest/browser";

const nextTask = () =>
  new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(undefined);
  });

export async function activateButton(button: Locator) {
  await expect.element(button).toBeVisible();
  await nextTask();
  (button.element() as HTMLButtonElement).click();
}

// Opens a visible disclosure unless it is open by then: the state is read in
// the same task as the click, so an opening the page commits during the
// yield is never toggled closed.
export async function expandButton(button: Locator) {
  await expect.element(button).toBeVisible();
  await nextTask();
  const element = button.element() as HTMLButtonElement;
  if (element.getAttribute("aria-expanded") === "false") element.click();
}

// Presses a control as a pointer does: it takes focus, then activates.
export async function pressButton(button: Locator) {
  await expect.element(button).toBeVisible();
  (button.element() as HTMLElement).focus({ preventScroll: true });
  await activateButton(button);
}

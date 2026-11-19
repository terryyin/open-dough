// Input to a mounted dashboard inside React's act: each action and every
// answer it starts settle before the case reads the page.
import { act } from "react";
import { expect } from "vitest";
import { userEvent, type Locator } from "vitest/browser";

// Resolves after the current task, so service answers and effects already
// started reach React. The fixture's timers fake neither message ports nor
// frames, so this wait and the next one pass in real time.
function nextTask() {
  return new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}

// Resolves after the next frame and the task after it, so observer callbacks
// the frame runs reach React too.
function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      void nextTask().then(resolve);
    });
  });
}

// Runs `action` inside act, then settles the page inside act: task rounds
// while the page still changes, then a frame round; it is settled when a frame
// round changes nothing, so answers that later effects request and observer
// callbacks of the new layout also reach React inside act.
export async function actSettled(action: () => unknown) {
  let changed = false;
  const changes = new MutationObserver(() => {
    changed = true;
  });
  changes.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  try {
    await act(async () => {
      await action();
      await nextTask();
    });
    let framed = false;
    for (let round = 0; round < 20; round += 1) {
      if (changes.takeRecords().length > 0) changed = true;
      if (framed && !changed) return;
      framed = !changed;
      changed = false;
      await act(framed ? nextFrame : nextTask);
    }
  } finally {
    changes.disconnect();
  }
}

async function onControl(
  locator: Locator,
  use: (control: HTMLElement) => void,
) {
  await actSettled(async () => {
    const element = await locator.findElement();
    if (!(element instanceof HTMLElement))
      throw new Error(`Expected a control: ${locator.selector}`);
    use(element);
  });
}

export async function click(locator: Locator) {
  await onControl(locator, (control) => {
    control.click();
  });
}

// Activates a control as a keyboard user does: focus, then a real Enter.
export async function press(locator: Locator) {
  await onControl(locator, (control) => {
    control.focus();
  });
  await expect.element(locator).toHaveFocus();
  await actSettled(() => userEvent.keyboard("{Enter}"));
}

// Types into a field inside act, as the built app's fill did.
export async function fill(locator: Locator, text: string) {
  await actSettled(() => locator.fill(text));
}

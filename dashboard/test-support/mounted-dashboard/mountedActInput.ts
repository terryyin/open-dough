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

// The rounds a mounted act waits for the page to settle before failing the case.
export const settleRounds = 20;

// A page still changing after `settleRounds` rounds, named so the case fails
// instead of reading a page React has not settled.
export class UnsettledPageError extends Error {
  override name = "UnsettledPageError";
  constructor() {
    super(`The page did not settle within ${settleRounds} rounds.`);
  }
}

// Settles the page inside act after `action`: task rounds while the page
// still changes and, with `frames`, a frame round; it is settled when a final
// round changes nothing. A page still changing after `settleRounds` rounds
// fails with `UnsettledPageError`.
async function settleAfter(action: () => unknown, frames: boolean) {
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
    // Whether the last round was a final one: with `frames` a frame round,
    // otherwise any task round.
    let final = !frames;
    for (let round = 0; round < settleRounds; round += 1) {
      if (changes.takeRecords().length > 0) changed = true;
      if (final && !changed) return;
      final = !frames || !changed;
      changed = false;
      await act(frames && final ? nextFrame : nextTask);
    }
    throw new UnsettledPageError();
  } finally {
    changes.disconnect();
  }
}

// Runs `action` inside act and settles with task and frame rounds, so answers
// that later effects request and observer callbacks of the new layout also
// reach React inside act: for mounts, clock advances, released reads and
// output the page receives.
export async function actSettled(action: () => unknown) {
  await settleAfter(action, true);
}

// Settles input with task rounds only: each answer and effect it starts
// reaches React inside act. Work that completes later, as a dialog's queued
// close, is awaited by its own event (`closing`).
async function inputSettled(action: () => unknown) {
  await settleAfter(action, false);
}

async function onControl(
  locator: Locator,
  use: (control: HTMLElement) => void,
) {
  await inputSettled(async () => {
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
  await inputSettled(() => userEvent.keyboard("{Enter}"));
}

// Types into a field inside act, as the built app's fill did.
export async function fill(locator: Locator, text: string) {
  await inputSettled(() => locator.fill(text));
}

// Runs `action`, which closes `dialog`, and finishes on that dialog's native
// close event inside act, since the browser queues the event after the input.
export async function closing(dialog: Locator, action: () => Promise<void>) {
  const element = await dialog.findElement();
  if (!(element instanceof HTMLDialogElement))
    throw new Error(`Expected a dialog: ${dialog.selector}`);
  const closed = new Promise<void>((resolve) => {
    element.addEventListener(
      "close",
      () => {
        resolve();
      },
      { once: true },
    );
  });
  await action();
  await inputSettled(() => closed);
}

import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  terminal,
  terminalInput,
  terminalStatus,
} from "../sessions/session-terminal-page.ts";
import { choosePrompt, reconnect } from "./terminal-input-controls.ts";
import { mountTerminalInput } from "./terminal-input-mount.ts";

const connectingFeedback =
  "The terminal is still connecting. Open Prompts again once it connects.";
const refusedFeedback = "Choose Reconnect, then open Prompts again.";

async function rejectsPrompt(feedback: string, sent: () => string[]) {
  await choosePrompt("OK");
  await expect
    .element(terminalStatus.getByText(feedback, { exact: true }))
    .toBeVisible();
  expect(sent()).toEqual([]);
}

async function choosesAfterRecovery(sent: () => string[]) {
  await expect
    .element(terminal.getByText("Claude Code", { exact: true }))
    .toBeVisible();
  expect(sent()).toEqual([]);
  await choosePrompt("as recommended");
  await expect.poll(sent).toEqual(["as recommended"]);
  await expect.element(terminalStatus).toBeEmptyDOMElement();
  await expect.element(terminalInput).toHaveFocus();
}

test("connecting input refuses presets, names recovery and requires a new choice", async () => {
  const { attachment, sent } = await mountTerminalInput({ connecting: true });
  await rejectsPrompt(connectingFeedback, sent);
  attachment.open();
  await choosesAfterRecovery(sent);
});

test("refused input refuses presets, names recovery and requires a new choice", async () => {
  const { attachment, sent } = await mountTerminalInput({ connecting: true });
  const explanation = "The session refused this attachment.";
  attachment.refuse(explanation);
  await expect
    .element(terminalStatus.getByText(explanation, { exact: true }))
    .toBeVisible();
  await rejectsPrompt(refusedFeedback, sent);
  await userEvent.click(reconnect);
  await choosesAfterRecovery(sent);
});

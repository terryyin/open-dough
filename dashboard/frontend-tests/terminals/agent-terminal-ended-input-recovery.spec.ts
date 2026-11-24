import { expect, onTestFinished, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { InstructionTranscriptionSource } from "../../src/instructionTranscriptionSource.ts";
import { audioInput } from "../launches/instruction-voice-page.ts";
import { portrait, useTouchScreen } from "../navigation/board-touch-page.ts";
import {
  sidebarButton,
  sidebarSession,
} from "../sessions/session-card-page.ts";
import {
  terminal,
  terminalInput,
  terminalStatus,
} from "../sessions/session-terminal-page.ts";
import {
  dictate,
  openAgain,
  tapTerminalControl,
  tapTerminalScreen,
} from "./terminal-input-controls.ts";
import { mountTerminalInput } from "./terminal-input-mount.ts";

test("an ended terminal keeps the transcript with Open again feedback, Paste names Open again, and reopening sends nothing until Insert transcript", async () => {
  const transcript = "Keep this for the reopened terminal.";
  const title = "Ended terminal input session";
  const record = makeMe.aLaunchRecord
    .adHoc({ instruction: "ended", title })
    .inClaudeSession({ sessionId: "ended-session", shortId: "ended01" })
    .please();
  let deliver: () => void = () => {
    throw new Error("The recording has no held answer.");
  };
  const answer = new Promise<{ text: string }>((resolve) => {
    deliver = () => {
      resolve({ text: transcript });
    };
  });
  const transcribe = vi.fn<InstructionTranscriptionSource["transcribe"]>(
    () => answer,
  );
  const capture = audioInput();
  const clipboardText = new Blob(["not for the ended terminal"], {
    type: "text/plain",
  });
  const readClipboard = vi
    .spyOn(navigator.clipboard, "read")
    .mockResolvedValue([new ClipboardItem({ "text/plain": clipboardText })]);
  onTestFinished(() => {
    readClipboard.mockRestore();
  });
  await useTouchScreen();
  const { attachment, sent } = await mountTerminalInput({
    viewport: portrait,
    record,
    openingLines: ["attached ended01", "Claude Code"],
    openSession: async () => {
      await tapTerminalControl(sidebarButton);
      await tapTerminalControl(sidebarSession(title));
    },
    transcription: { configured: () => Promise.resolve(true), transcribe },
  });
  await tapTerminalControl(dictate);
  await expect
    .element(
      terminalStatus.getByText(
        "Recording… Stop recording when you are finished.",
      ),
    )
    .toBeVisible();
  await capture.recordedAudio();
  await tapTerminalControl(
    terminal.getByRole("button", { name: "Stop recording", exact: true }),
  );
  await expect.poll(() => transcribe.mock.calls.length).toBe(1);
  await expect
    .element(terminalStatus.getByText("Transcribing…", { exact: true }))
    .toBeVisible();
  await tapTerminalScreen();
  await expect.element(terminalInput).toHaveFocus();
  await userEvent.keyboard("{Control>}z{/Control}");
  await expect.poll(sent).toEqual(["\u001a"]);
  attachment.end();
  await expect
    .element(terminalStatus.getByText("The terminal ended", { exact: false }))
    .toBeVisible();
  await expect.element(openAgain).toBeVisible();
  deliver();

  const unsent = terminal.getByRole("textbox", { name: "Unsent transcript" });
  const insert = terminal.getByRole("button", {
    name: "Insert transcript",
    exact: true,
  });
  await expect.element(unsent).toHaveValue(transcript);
  await expect
    .element(
      terminalStatus.getByText(
        "The transcript was not inserted. Open again, then insert it here or discard it.",
        { exact: false },
      ),
    )
    .toBeVisible();
  expect(sent()).toEqual(["\u001a"]);
  await tapTerminalControl(
    terminal.getByRole("button", { name: "Paste", exact: true }),
  );
  await expect
    .element(
      terminalStatus.getByText("Tap Open again, then tap Paste again.", {
        exact: true,
      }),
    )
    .toBeVisible();
  expect(readClipboard).toHaveBeenCalledOnce();
  await tapTerminalControl(insert);
  await expect.element(unsent).toHaveValue(transcript);
  expect(sent()).toEqual(["\u001a"]);

  await tapTerminalControl(openAgain);
  await expect.element(openAgain).not.toBeInTheDocument();
  await expect
    .element(terminal.getByText("Claude Code", { exact: true }))
    .toBeVisible();
  await expect.element(unsent).toHaveValue(transcript);
  expect(sent()).toEqual(["\u001a"]);
  await tapTerminalControl(insert);
  await expect.element(unsent).not.toBeInTheDocument();
  await expect.poll(sent).toEqual(["\u001a", transcript]);
  await expect
    .element(terminal.getByText(transcript, { exact: true }))
    .toBeVisible();
});

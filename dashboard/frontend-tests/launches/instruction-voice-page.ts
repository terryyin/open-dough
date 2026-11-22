import { createElement, useState } from "react";
import { expect, onTestFinished, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  defaultSessionPolicy,
  unattachedPolicyOf,
} from "../../src/agentLaunch.ts";
import { LaunchDialog } from "../../src/LaunchDialog.tsx";
import { storySession } from "../../src/LaunchSessionPolicy.tsx";
import type { LaunchDialogProps } from "../../src/LaunchDialogProps.ts";
import type { InstructionTranscriptionSource } from "../../src/instructionTranscriptionSource.ts";
import { unattachedSession } from "../../src/UnattachedSessionPolicy.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";

export const originalDraft = "Keep this work local";
const recordPrompt = "Recording… Stop recording when you are finished.";

export function audioInput() {
  const audio = new AudioContext();
  const destination = audio.createMediaStreamDestination();
  const tone = audio.createOscillator();
  tone.connect(destination);
  tone.start();
  const streams: MediaStream[] = [];
  const openStream = async () => {
    await audio.resume();
    const stream = destination.stream.clone();
    streams.push(stream);
    return stream;
  };
  const getUserMedia = vi
    .spyOn(navigator.mediaDevices, "getUserMedia")
    .mockImplementation(openStream);
  const format = vi.spyOn(MediaRecorder, "isTypeSupported");
  const tracks = () => streams.flatMap((stream) => stream.getTracks());
  onTestFinished(async () => {
    getUserMedia.mockRestore();
    format.mockRestore();
    tracks().forEach((track) => {
      track.stop();
    });
    await audio.close();
  });
  return { getUserMedia, format, tracks, openStream };
}

export async function mountInstructionVoice(
  kind: "story" | "session" = "session",
) {
  const transcribe = vi
    .fn<InstructionTranscriptionSource["transcribe"]>()
    .mockResolvedValue({ text: "Do not implement yet" });
  const transcription: InstructionTranscriptionSource = {
    configured: () => Promise.resolve(true),
    transcribe,
  };
  const send = vi.fn<LaunchDialogProps["onStart"]>().mockResolvedValue(true);
  const project = makeMe.aPublishedSource.openDough.please();
  const fieldLabel = "Instruction (optional)";
  const session =
    kind === "story"
      ? storySession({
          policy: defaultSessionPolicy,
          onPolicy: vi.fn(),
          offer: "offered",
          kept: false,
          workflowName: "execution",
        })
      : unattachedSession({
          policy: unattachedPolicyOf({}),
          onPolicy: vi.fn(),
          offer: "offered",
        });
  const hostOptions = makeMe.aLaunchHostOptions.with({ models: [] }).please();
  const readOptions = () => Promise.resolve(hostOptions);
  function Launcher() {
    const [open, setOpen] = useState(false);
    return [
      createElement(
        "button",
        {
          key: "trigger",
          onClick: () => {
            setOpen(true);
          },
        },
        "Open launch",
      ),
      open
        ? createElement(LaunchDialog, {
            key: "dialog",
            sourceId: project.id,
            projectContext: true,
            readOptions,
            transcription,
            host: "claude",
            heading: `Start a session in ${project.label}`,
            description: "Start a background session.",
            fieldLabel,
            session,
            onStart: send,
            onClose: () => {
              setOpen(false);
            },
          })
        : null,
    ];
  }
  // Vitest skips the outer browser resize if the viewport matches its default.
  await mountComponent(createElement(Launcher), {
    viewport: { width: 390, height: 760 },
  });
  const action = page.getByRole("button", { name: "Open launch" });
  await action.click();
  const form = launchDialog();
  const inDialog = form.dialog;
  const status = inDialog.getByRole("status");
  const field = inDialog.getByRole("textbox", { name: fieldLabel });
  const record = inDialog.getByRole("button", { name: "Record", exact: true });
  const stop = inDialog.getByRole("button", {
    name: "Stop recording",
    exact: true,
  });
  const begin = async () => {
    await record.click();
    await expect.element(status).toHaveTextContent(recordPrompt);
    await expect.element(form.start).toBeDisabled();
    await expect.element(field).toHaveAttribute("readonly");
  };
  const candidate = inDialog.getByRole("textbox", {
    name: "Transcript to shorten",
  });
  const add = inDialog.getByRole("button", {
    name: "Add transcript",
    exact: true,
  });
  const discard = inDialog.getByRole("button", {
    name: "Discard transcript",
    exact: true,
  });
  const problem = inDialog.getByRole("alert");
  const recordClip = async () => {
    await begin();
    await stop.click();
  };
  const ready = async () => {
    await expect
      .element(status)
      .toHaveTextContent("Dictate, then review or edit the text before Start.");
    await expect.element(field).not.toHaveAttribute("readonly");
    await expect.element(form.start).toBeEnabled();
    await expect.element(record).toBeEnabled();
    await expect.element(stop).toBeDisabled();
  };
  return {
    ...form,
    action,
    status,
    field,
    record,
    stop,
    begin,
    candidate,
    add,
    discard,
    problem,
    recordClip,
    ready,
    send,
    transcribe,
  };
}

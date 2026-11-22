import { createElement } from "react";
import { expect, onTestFinished, test, vi } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { StartSession } from "../../src/StartSession.tsx";
import {
  launchAttachmentEndpoint,
  launchAttachmentLimitBytes,
} from "../../src/launchAttachments.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  adHocLaunches,
  launchDialog,
  startSession,
} from "./ad-hoc-launch-page.ts";

const draft = "Why is this card clipped?";
const png = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  ),
  (byte) => byte.charCodeAt(0),
);

function image(name: string) {
  return new File([png], name, { type: "image/png" });
}

async function mountStartSession() {
  const project = makeMe.aPublishedSource.openDough.please();
  const launches = adHocLaunches();
  await mountComponent(
    createElement(StartSession, {
      project: project.label,
      sourceId: project.id,
      launches,
      presentTerminal: vi.fn(),
    }),
    { viewport: { width: 1000, height: 720 } },
  );
  const offer = startSession(project.label);
  await offer.click();
  const form = launchDialog("Start a session in Open Dough in Claude Code");
  return {
    offer,
    form,
    attached: form.dialog.getByRole("list", { name: "Attached images" }),
    refused: form.dialog.getByRole("alert", { name: "Refused images" }),
    start: launches.startAdHoc,
  };
}

async function chooseFiles(dialog: Locator, files: File[]) {
  await expect
    .element(dialog.getByRole("button", { name: "Attach images" }))
    .toBeEnabled();
  const picker = dialog
    .element()
    .querySelector<HTMLInputElement>("input[type=file]");
  if (picker === null)
    throw new Error("The launch dialog has no image picker.");
  // Keep the oversized sample in Chromium while delivering the picker's FileList.
  const selected = new DataTransfer();
  for (const file of files) selected.items.add(file);
  picker.files = selected.files;
  picker.dispatchEvent(new Event("change", { bubbles: true }));
}

test("pasting text into the instruction inserts it without attaching an image", async () => {
  const { form, attached } = await mountStartSession();
  await form.instruction.fill(" Look closer.");
  await userEvent.keyboard("{selectall}");
  await userEvent.copy();
  await form.instruction.fill(draft);
  const input = form.instruction.element() as HTMLTextAreaElement;
  input.setSelectionRange(draft.length, draft.length);

  await userEvent.paste();

  await expect.element(form.instruction).toHaveValue(`${draft} Look closer.`);
  await expect.element(attached).not.toBeInTheDocument();
});

test("refused images explain why, keep the draft, and leave only accepted images for Start", async () => {
  const { form, attached, refused, start } = await mountStartSession();
  await form.instruction.fill(draft);
  await chooseFiles(form.dialog, [image("card.png")]);
  await expect.element(attached.getByText("Image 1 · card.png")).toBeVisible();

  const pdf = new File(["%PDF-1.4"], "notes.pdf", { type: "application/pdf" });
  const pdfReason = refused.getByText(
    "notes.pdf · Not an image (PNG, JPEG, GIF or WebP).",
  );
  await chooseFiles(form.dialog, [pdf]);
  await expect.element(pdfReason).toBeVisible();
  await expect.element(form.instruction).toHaveValue(draft);

  await chooseFiles(form.dialog, [
    pdf,
    new File([new Uint8Array(launchAttachmentLimitBytes + 1)], "huge.png", {
      type: "image/png",
    }),
  ]);
  await expect
    .element(
      refused.getByText(
        "huge.png · Larger than 10 MB. Choose a smaller image or omit it.",
      ),
    )
    .toBeVisible();
  await expect.element(pdfReason).toBeVisible();
  expect(attached.element().querySelectorAll("img")).toHaveLength(1);
  await expect.element(attached.getByText("Image 1 · card.png")).toBeVisible();
  await expect.element(form.instruction).toHaveValue(draft);
  await expect.element(form.host).toHaveValue("claude");
  const workspace = form.dialog.getByRole("radio", { name: "Default main" });
  await expect.element(workspace).toBeChecked();
  await expect
    .element(form.dialog.getByRole("radio", { name: "Wait for review" }))
    .toBeChecked();

  await chooseFiles(
    form.dialog,
    [0, 1, 2, 3, 4].map((index) => image(`extra-${String(index)}.png`)),
  );
  await expect
    .element(refused.getByText("extra-4.png · At most 5 images"))
    .toBeVisible();
  expect(attached.element().querySelectorAll("img")).toHaveLength(5);
  await expect.element(attached.getByText("Image 1 · card.png")).toBeVisible();
  await expect
    .element(attached.getByText("Image 5 · extra-3.png"))
    .toBeVisible();
  await expect.element(form.instruction).toHaveValue(draft);
  await expect.element(workspace).toBeChecked();

  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(start).toHaveBeenCalledTimes(1);
  const choices = start.mock.calls[0]?.[1];
  expect(choices?.instruction).toBe(draft);
  expect(choices?.images?.map(({ name }) => name)).toEqual([
    "card.png",
    "extra-0.png",
    "extra-1.png",
    "extra-2.png",
    "extra-3.png",
  ]);
});

async function dismissWithAttachment(
  dismiss: (form: ReturnType<typeof launchDialog>) => Promise<void>,
) {
  const fetch = vi.spyOn(globalThis, "fetch");
  onTestFinished(() => {
    fetch.mockRestore();
  });
  const { offer, form, attached, start } = await mountStartSession();
  await form.instruction.fill(draft);
  await chooseFiles(form.dialog, [image("card.png")]);
  await expect.element(attached.getByText("Image 1 · card.png")).toBeVisible();

  await dismiss(form);
  await expect.element(form.dialog).not.toBeInTheDocument();
  await offer.click();

  await expect.element(form.instruction).toHaveValue("");
  await expect.element(attached).not.toBeInTheDocument();
  expect(start).not.toHaveBeenCalled();
  expect(fetch.mock.calls.map(([request]) => request)).not.toContain(
    launchAttachmentEndpoint,
  );
}

test("Cancel after attaching uploads nothing and opens an empty draft next time", () =>
  dismissWithAttachment((form) => form.cancel.click()));

test("Escape after attaching uploads nothing and opens an empty draft next time", () =>
  dismissWithAttachment(() => userEvent.keyboard("{Escape}")));

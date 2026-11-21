// The rendered OpenAI section owns change ordering and the password draft.
// Private persistence, no echo and no egress are in the Configuration E2E spec.
import { describe, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { OpenAIConfigurationStatus } from "../../src/openAIConfiguration.ts";
import type { OpenAIConfigurationSource } from "../../src/openAIConfigurationSource.ts";
import { enableSettingsTouch } from "./system-settings-browser.ts";
import { mountOpenAISettings } from "./system-settings-openai-page.ts";

const key = "sk-synthetic-held-status-084";
const status = (configured: boolean) =>
  makeMe.anOpenAIConfigurationStatus.with({ configured }).please();

// The caller first settles its typed reply. A frame and its successor let any
// React update it scheduled reach the rendered status before a negative check.
function afterStatusRender() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

test("a held status response cannot overwrite successful save", async () => {
  let answerRead!: (answer: OpenAIConfigurationStatus) => void;
  const heldStatus = new Promise<OpenAIConfigurationStatus>((resolve) => {
    answerRead = resolve;
  });
  const read = vi.fn<OpenAIConfigurationSource["read"]>(() => heldStatus);
  const save = vi
    .fn<OpenAIConfigurationSource["save"]>()
    .mockResolvedValue(status(true));
  const remove = vi
    .fn<OpenAIConfigurationSource["remove"]>()
    .mockResolvedValue(status(false));
  const settings = await mountOpenAISettings({ read, save, remove });
  await expect.poll(() => read.mock.calls.length).toBe(1);
  await settings.enterDraft(key);
  await settings.save();
  await settings.showsStatus("Configured");

  answerRead(status(false));
  await heldStatus;
  await afterStatusRender();
  await settings.showsStatus("Configured");
  await settings.showsNoProblem();
  await settings.showsDraft("");
  await settings.showsFocusedDraft();
  settings.doesNotEcho(key);
  expect(save.mock.calls).toEqual([[key]]);
  expect(remove).not.toHaveBeenCalled();
});

test("a held status response cannot overwrite successful remove", async () => {
  let answerRead!: (answer: OpenAIConfigurationStatus) => void;
  const heldStatus = new Promise<OpenAIConfigurationStatus>((resolve) => {
    answerRead = resolve;
  });
  const read = vi
    .fn<OpenAIConfigurationSource["read"]>()
    .mockResolvedValueOnce(status(false))
    .mockReturnValueOnce(heldStatus);
  const save = vi
    .fn<OpenAIConfigurationSource["save"]>()
    .mockResolvedValue(status(true));
  const remove = vi
    .fn<OpenAIConfigurationSource["remove"]>()
    .mockResolvedValue(status(false));
  const settings = await mountOpenAISettings({ read, save, remove });
  await settings.showsStatus("Not configured");
  await settings.enterDraft(key);
  await settings.save();
  await settings.showsStatus("Configured");
  await settings.showsDraft("");
  await settings.save();
  await settings.showsProblem("Enter an API key");
  await settings.retryStatus();
  await expect.poll(() => read.mock.calls.length).toBe(2);
  await settings.remove();
  await settings.showsStatus("Not configured");

  answerRead(status(true));
  await heldStatus;
  await afterStatusRender();
  await settings.showsStatus("Not configured");
  await settings.showsNoProblem();
  await settings.showsDraft("");
  await settings.showsFocusedDraft();
  settings.doesNotEcho(key);
  expect(save.mock.calls).toEqual([[key]]);
  expect(remove.mock.calls).toEqual([[]]);
});

test("a held status response cannot overwrite successful save after read error", async () => {
  const refusal = new Error("The saved OpenAI API key could not be read.");
  let releaseRead!: () => void;
  const heldStatus = new Promise<void>((resolve) => {
    releaseRead = resolve;
  }).then(() => {
    throw refusal;
  });
  const read = vi
    .fn<OpenAIConfigurationSource["read"]>()
    .mockRejectedValueOnce(refusal)
    .mockReturnValueOnce(heldStatus);
  const save = vi
    .fn<OpenAIConfigurationSource["save"]>()
    .mockResolvedValue(status(true));
  const remove = vi
    .fn<OpenAIConfigurationSource["remove"]>()
    .mockResolvedValue(status(false));
  const settings = await mountOpenAISettings({ read, save, remove });
  await settings.showsProblem(refusal.message);
  await settings.retryStatus();
  await expect.poll(() => read.mock.calls.length).toBe(2);
  await settings.enterDraft(key);
  await settings.save();
  await settings.showsStatus("Configured");

  releaseRead();
  await expect(heldStatus).rejects.toBe(refusal);
  await afterStatusRender();
  await settings.showsStatus("Configured");
  await settings.showsNoProblem();
  await settings.showsDraft("");
  await settings.showsFocusedDraft();
  settings.doesNotEcho(key);
  expect(save.mock.calls).toEqual([[key]]);
  expect(remove).not.toHaveBeenCalled();
});

const original = "sk-synthetic-original-084";
const replacement = "sk-synthetic-replacement-084";
const portrait = { width: 390, height: 844 };
const landscape = { width: 844, height: 390 };
const reduced = { width: portrait.width, height: 320 };

describe("phone OpenAI settings recovery", () => {
  test("touch keeps the password draft and the configured key through reduced height, rotation, a refused save and explicit recovery", async () => {
    const refusal = new Error(
      "The OpenAI API key could not be saved. Check the credential folder permissions and retry; the previous key was kept.",
    );
    const changes: ({ readonly save: string } | "remove")[] = [];
    const read = vi
      .fn<OpenAIConfigurationSource["read"]>()
      .mockResolvedValueOnce(status(false))
      .mockResolvedValueOnce(status(true));
    const save = vi.fn<OpenAIConfigurationSource["save"]>((draft) => {
      changes.push({ save: draft });
      return changes.length === 2
        ? Promise.reject(refusal)
        : Promise.resolve(status(true));
    });
    const remove = vi.fn<OpenAIConfigurationSource["remove"]>(() => {
      changes.push("remove");
      return Promise.resolve(status(false));
    });
    await enableSettingsTouch();
    const settings = await mountOpenAISettings(
      { read, save, remove },
      portrait,
    );
    await settings.readStatus();
    await settings.showsStatus("Not configured");
    await settings.scrollDraft("end");
    await settings.tapDraft();
    await settings.typeDraft(original);
    await settings.tapSave();
    await settings.showsStatus("Configured");
    await settings.showsDraft("");
    await settings.showsFocusedDraft();
    await settings.scrollDraft();
    await settings.tapDraft();
    await settings.typeDraft(replacement);
    await settings.useViewport(reduced);
    await settings.scrollDraft();
    await settings.tapDraft();
    const { start, end } = settings.draftCaret();
    await settings.typeDraft("-edited");
    const draft = `${replacement.slice(0, start)}-edited${replacement.slice(end)}`;
    await settings.showsDraft(draft);
    await settings.showsFocusedDraft();
    for (const view of [landscape, portrait, reduced]) {
      await settings.useViewport(view);
      await settings.scrollDraft();
      await settings.showsDraft(draft);
    }
    expect(changes).toEqual([{ save: original }]);
    await settings.tapSave();
    await settings.showsProblem(refusal.message);
    await settings.showsDraft(draft);
    await settings.showsStatus("Configured");
    await settings.readProblem();
    await settings.tapRetryStatus();
    await expect.poll(() => read.mock.calls.length).toBe(2);
    await settings.showsNoProblem();
    await settings.showsDraft(draft);
    await settings.scrollDraft();
    await settings.tapSave();
    await settings.showsDraft("");
    await settings.showsFocusedDraft();
    await settings.scrollDraft();
    await settings.tapRemove();
    await settings.showsStatus("Not configured");
    expect(changes).toEqual([
      { save: original },
      { save: draft },
      { save: draft },
      "remove",
    ]);
  });
});

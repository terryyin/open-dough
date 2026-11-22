import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchHostOptions } from "../../src/launchHostOptions.ts";
import type { ReadLaunchHostOptions } from "../../src/launchHostOptionsClient.ts";
import {
  codexCatalog,
  hold,
  mountCatalogDialog,
  optionLabels,
} from "./launch-host-options-page.ts";

test("a held Codex read keeps Start available and a failed read offers retry without moving instruction focus", async () => {
  const first = hold<LaunchHostOptions>();
  const read = vi
    .fn<ReadLaunchHostOptions>()
    .mockReturnValueOnce(first.answer)
    .mockResolvedValue(codexCatalog());
  const { form, start, close, reopen } = await mountCatalogDialog({
    readOptions: read,
    initialHost: "codex",
  });
  await expect
    .element(form.dialog.getByText(/Reading Codex model choices/))
    .toBeVisible();
  await expect.element(form.instruction).toHaveFocus();
  await expect.element(form.start).toBeEnabled();
  await expect
    .poll(() =>
      read.mock.calls.map(([request]) => [
        request.source,
        request.host,
        request.projectContext,
      ]),
    )
    .toEqual([["open-dough", "codex", true]]);
  first.reject(new Error("unreadable"));
  const retry = form.dialog.getByRole("button", {
    name: "Retry model choices",
  });
  await expect.element(retry).toBeVisible();
  await expect.element(form.instruction).toHaveFocus();
  await expect.element(form.host).toHaveValue("codex");
  await expect.element(form.effort).toHaveValue("");
  await retry.click();
  await expect
    .poll(() => optionLabels(form.model))
    .toEqual(["Use Codex setting", "Native Sol", "Native Luna"]);
  await form.model.selectOptions("native-sol");
  await form.effort.selectOptions("ultra");
  await form.host.selectOptions("claude");
  await expect.element(form.model).toHaveValue("");
  await form.host.selectOptions("codex");
  await expect.element(form.model).toHaveValue("");
  await form.model.selectOptions("native-sol");
  await form.cancel.click();
  await expect.poll(() => close.mock.calls).toEqual([[false]]);
  reopen("codex");
  await expect.element(form.model).toHaveValue("");
  await expect.element(form.effort).toHaveValue("");
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => close.mock.calls).toEqual([[false], [false]]);
  expect(start).not.toHaveBeenCalled();
});

test("switching host aborts the old catalog and a late Codex answer leaves Claude choices intact", async () => {
  const pending = hold<LaunchHostOptions>();
  const read = vi.fn<ReadLaunchHostOptions>().mockReturnValue(pending.answer);
  const { form } = await mountCatalogDialog({ readOptions: read });
  await form.host.selectOptions("codex");
  await expect
    .poll(() =>
      read.mock.calls.map(([request]) => [request.source, request.host]),
    )
    .toEqual([["open-dough", "codex"]]);
  await form.host.selectOptions("claude");
  await expect.poll(() => read.mock.calls[0]?.[0].signal.aborted).toBe(true);
  pending.resolve(codexCatalog());
  await form.instruction.fill("still on Claude");
  await expect
    .poll(() => optionLabels(form.model))
    .toEqual(["Default (your Claude Code setting)", "Fable", "Opus", "Sonnet"]);
  await userEvent.keyboard("{Escape}");
});

test("switching project aborts the old catalog and its late answer leaves the current project's models intact", async () => {
  const previous = hold<LaunchHostOptions>();
  const read = vi
    .fn<ReadLaunchHostOptions>()
    .mockReturnValueOnce(previous.answer)
    .mockResolvedValue(
      makeMe.aLaunchHostOptions
        .with({
          models: [
            {
              model: "project-luna",
              name: "Project Luna",
              description: "Current catalog",
              efforts: [],
            },
          ],
        })
        .please(),
    );
  const { form, show } = await mountCatalogDialog({
    readOptions: read,
    initialHost: "codex",
  });
  await expect
    .poll(() => read.mock.calls.map(([request]) => request.source))
    .toEqual(["open-dough"]);
  const project = makeMe.aPublishedSource.pygardon.please();
  show(project, "codex");
  await expect
    .poll(() => read.mock.calls.map(([request]) => request.source))
    .toEqual(["open-dough", project.id]);
  await expect
    .poll(() => optionLabels(form.model))
    .toEqual(["Use Codex setting", "Project Luna"]);
  expect(read.mock.calls[0]?.[0].signal.aborted).toBe(true);
  previous.resolve(codexCatalog());
  await form.instruction.fill("still in the current project");
  await expect
    .poll(() => optionLabels(form.model))
    .toEqual(["Use Codex setting", "Project Luna"]);
  await userEvent.keyboard("{Escape}");
});

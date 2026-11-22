import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReadLaunchHostOptions } from "../../src/launchHostOptionsClient.ts";
import { followsTabOrder } from "./ad-hoc-launch-page.ts";
import {
  codexCatalog,
  mountCatalogDialog,
  optionLabels,
} from "./launch-host-options-page.ts";
import {
  resizeLaunchViewport,
  twiceZoomedDialog,
  useTwiceZoomedDevice,
} from "./launch-layout-page.ts";

test("Codex model changes preserve compatible effort and keep incompatible effort invalid with linked feedback", async () => {
  const read = vi.fn<ReadLaunchHostOptions>().mockResolvedValue(codexCatalog());
  const { form, reopen, start } = await mountCatalogDialog({
    readOptions: read,
    initialHost: "codex",
  });
  await form.model.selectOptions("native-sol");
  await expect
    .poll(() => optionLabels(form.effort))
    .toEqual(["Use Codex setting", "low — Quick", "ultra — Deep"]);
  await form.effort.selectOptions("ultra");
  await form.model.selectOptions("native-luna");
  await expect.element(form.effort).toHaveValue("ultra");
  await expect.element(form.effort).toHaveAttribute("aria-invalid", "true");
  await expect
    .element(form.effort)
    .toHaveAccessibleDescription(/cannot be verified/);
  await expect.element(form.start).toBeDisabled();

  await form.effort.selectOptions("low");
  await form.model.selectOptions("native-sol");
  await expect.element(form.effort).toHaveValue("low");
  await expect.element(form.start).toBeEnabled();
  await form.instruction.click();
  await followsTabOrder([
    form.dialog.getByRole("button", { name: "Record", exact: true }),
    form.dialog.getByRole("button", { name: "Attach images" }),
    form.host,
    form.model,
    form.effort,
  ]);
  await form.effort.selectOptions("");
  await expect.element(form.effort).not.toHaveAttribute("aria-invalid", "true");
  await form.model.selectOptions("native-luna");
  await form.effort.selectOptions("low");
  await form.host.selectOptions("claude");
  await expect.element(form.effort).toHaveValue("medium");
  await form.host.selectOptions("codex");
  await expect.element(form.effort).toHaveValue("");
  await form.model.selectOptions("native-sol");
  await form.effort.selectOptions("ultra");
  await form.cancel.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  reopen("codex");
  await expect.element(form.effort).toHaveValue("");
  await expect.element(form.model).toHaveValue("");
  await userEvent.keyboard("{Escape}");
  expect(start).not.toHaveBeenCalled();
});

test("an unknown configured Codex model leaves defaults usable and Start visible at narrow and zoomed widths", async () => {
  const read = vi
    .fn<ReadLaunchHostOptions>()
    .mockResolvedValue(codexCatalog("custom-model"));
  const { form } = await mountCatalogDialog({
    readOptions: read,
    initialHost: "codex",
    viewport: { width: 390, height: 600 },
  });
  await expect.poll(() => optionLabels(form.effort)).toHaveLength(3);
  await expect
    .element(
      form.dialog.getByText(
        /Codex resolves its configured reasoning effort in the launch workspace/,
      ),
    )
    .toBeVisible();
  await expect.element(form.start).toBeEnabled();
  await expect.element(form.start).toBeInViewport();
  await form.effort.selectOptions("ultra");
  await expect
    .element(
      form.dialog.getByText(/will be verified there before initial input/),
    )
    .toBeVisible();
  await resizeLaunchViewport(twiceZoomedDialog);
  await useTwiceZoomedDevice();
  await expect.element(form.start).toBeInViewport();
  await form.effort.selectOptions("");
  await expect.element(form.start).toBeEnabled();
  await userEvent.keyboard("{Escape}");
});

test("Cursor model changes keep an unsupported effort invalid until a listed effort is selected", async () => {
  const catalog = makeMe.aLaunchHostOptions
    .with({
      models: [
        {
          model: "fixture-orb",
          name: "Fixture Orb",
          description: "",
          efforts: [{ effort: "high", description: "" }],
        },
        {
          model: "fixture-luna",
          name: "Fixture Luna",
          description: "",
          efforts: [{ effort: "medium", description: "" }],
        },
      ],
    })
    .please();
  const read = vi.fn<ReadLaunchHostOptions>().mockResolvedValue(catalog);
  const { form } = await mountCatalogDialog({
    readOptions: read,
    initialHost: "cursor",
  });
  await form.model.selectOptions("fixture-orb");
  await form.effort.selectOptions("high");
  await form.model.selectOptions("fixture-luna");
  await expect.element(form.effort).toHaveValue("high");
  await expect.element(form.effort).toHaveAttribute("aria-invalid", "true");
  await expect.element(form.start).toBeDisabled();
  await expect
    .element(form.effort)
    .toHaveAccessibleDescription(/cannot be verified/);
  await form.effort.selectOptions("medium");
  await expect.element(form.effort).not.toHaveAttribute("aria-invalid", "true");
  await expect.element(form.start).toBeEnabled();
});

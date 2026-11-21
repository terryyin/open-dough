import { createElement } from "react";
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { OpenAISettings } from "../../src/OpenAISettings.tsx";
import type { OpenAIConfigurationSource } from "../../src/openAIConfigurationSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  readSettingText,
  tapSettingWhereShown,
} from "./system-settings-browser.ts";
import "../../src/project-configuration.css";

type Viewport = { readonly width: number; readonly height: number };

export async function mountOpenAISettings(
  source: OpenAIConfigurationSource,
  viewport?: Viewport,
) {
  await mountComponent(
    createElement(
      "main",
      { className: "system-settings" },
      createElement(OpenAISettings, { source }),
    ),
    viewport && { viewport },
  );
  const section = page.getByRole("region", { name: "OpenAI", exact: true });
  const status = section.getByRole("status").filter({ hasText: "API key:" });
  const input = section.getByLabelText("API key", { exact: true });
  const save = section.getByRole("button", {
    name: "Save API key",
    exact: true,
  });
  const retry = section.getByRole("button", {
    name: "Retry status",
    exact: true,
  });
  const remove = section.getByRole("button", {
    name: "Remove API key",
    exact: true,
  });
  const problem = section.getByRole("alert");

  return {
    enterDraft: (draft: string) => userEvent.fill(input, draft),
    typeDraft: (text: string) => userEvent.keyboard(text),
    save: () => userEvent.click(save),
    retryStatus: () => userEvent.click(retry),
    remove: () => userEvent.click(remove),
    tapDraft: () => tapSettingWhereShown(input),
    tapSave: () => tapSettingWhereShown(save),
    tapRetryStatus: () => tapSettingWhereShown(retry),
    tapRemove: () => tapSettingWhereShown(remove),
    readStatus: () => readSettingText(status),
    readProblem: () => readSettingText(problem),
    showsStatus: (value: "Configured" | "Not configured") =>
      expect.element(status).toHaveTextContent(`API key: ${value}`),
    showsProblem: (message: string) =>
      expect.element(problem.filter({ hasText: message })).toBeVisible(),
    showsNoProblem: () => expect.element(problem).not.toBeInTheDocument(),
    showsDraft: (draft: string) => expect.element(input).toHaveValue(draft),
    showsFocusedDraft: () => expect.element(input).toHaveFocus(),
    doesNotEcho: (key: string) => {
      expect(document.body.textContent).not.toContain(key);
    },
    async scrollDraft(block: ScrollLogicalPosition = "nearest") {
      await expect.element(input).toBeVisible();
      input.element().scrollIntoView({ block, inline: "nearest" });
    },
    draftCaret() {
      const field = input.element() as HTMLInputElement;
      return { start: field.selectionStart ?? 0, end: field.selectionEnd ?? 0 };
    },
    async useViewport(view: Viewport) {
      await page.viewport(view.width, view.height);
      await expect
        .poll(() => ({ width: innerWidth, height: innerHeight }))
        .toEqual(view);
    },
  };
}

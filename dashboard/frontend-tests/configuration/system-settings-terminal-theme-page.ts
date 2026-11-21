import { createElement } from "react";
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { SavedTerminalThemeProvider } from "../../src/savedTerminalTheme.ts";
import { TerminalThemeSettings } from "../../src/TerminalThemeSettings.tsx";
import type { TerminalThemeSource } from "../../src/terminalThemeSource.ts";
import type { TerminalThemeId } from "../../src/terminalThemes.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { contrastRatio } from "../../test-support/composedColours.ts";
import {
  readSettingText,
  resizeSettingsViewport,
  settingsColourScheme,
  tapSettingWhereShown,
  type SettingsViewport,
} from "./system-settings-browser.ts";
import { paintContrast, tokenColour } from "./system-settings-reading.ts";
import "../../src/project-configuration.css";

const palettes = {
  Default: ["rgb(0, 0, 0)", "rgb(255, 255, 255)", "rgb(204, 0, 0)"],
  Light: ["rgb(255, 255, 255)", "rgb(31, 35, 40)", "rgb(207, 34, 46)"],
  "Solarized Dark": [
    "rgb(0, 43, 54)",
    "rgb(131, 148, 150)",
    "rgb(220, 50, 47)",
  ],
} as const;

function scrollTo(control: Locator) {
  control.element().scrollIntoView({ block: "nearest" });
}

export async function mountTerminalThemeSettings(
  source: TerminalThemeSource,
  viewport?: SettingsViewport,
) {
  const setScheme = settingsColourScheme();
  await mountComponent(
    createElement(
      "main",
      { className: "system-settings" },
      createElement(SavedTerminalThemeProvider, {
        source,
        children: createElement(TerminalThemeSettings),
      }),
    ),
    viewport && { viewport },
  );
  const region = page.getByRole("region", {
    name: "Terminal theme",
    exact: true,
  });
  const heading = region.getByRole("heading", {
    name: "Terminal theme",
    exact: true,
  });
  const choice = region.getByRole("combobox", {
    name: "Terminal theme",
    exact: true,
  });
  const figure = region.getByRole("figure", { name: /^Sample: / });
  const caption = figure.getByText(/^Sample: /);
  const refusal = region.getByRole("alert");
  const retry = refusal.getByRole("button", { name: "Retry", exact: true });

  return {
    choose: (theme: TerminalThemeId) => userEvent.selectOptions(choice, theme),
    async touchChoice(theme: TerminalThemeId) {
      await expect.element(choice).toBeEnabled();
      scrollTo(choice);
      await tapSettingWhereShown(choice);
      await userEvent.selectOptions(choice, theme);
    },
    async touchRetry() {
      scrollTo(retry);
      await tapSettingWhereShown(retry);
    },
    showsSaving: () =>
      expect
        .element(region.getByRole("status"))
        .toHaveTextContent("Saving terminal theme…"),
    showsReady: () => expect.element(choice).toBeEnabled(),
    showsNoRefusal: () => expect.element(refusal).not.toBeInTheDocument(),
    showsRefusal: (message: string) =>
      expect.element(refusal.filter({ hasText: message })).toBeVisible(),
    readExplanation: () =>
      readSettingText(
        region.getByText(
          /^Choose the colours embedded terminals use on this machine\./,
        ),
      ),
    readRefusal: () => readSettingText(refusal),
    readSample: () => readSettingText(caption),
    async showsTheme(label: keyof typeof palettes) {
      const [background, foreground, red] = palettes[label];
      await expect
        .poll(
          () =>
            (choice.element() as HTMLSelectElement).selectedOptions.item(0)
              ?.label,
        )
        .toBe(label);
      await expect.element(caption).toHaveTextContent(`Sample: ${label}`);
      const screen = figure.element().querySelector("pre");
      if (screen === null) throw new Error("The terminal sample has no screen");
      await expect
        .element(page.elementLocator(screen))
        .toHaveStyle({ backgroundColor: background, color: foreground });
      await expect
        .element(figure.getByText("red", { exact: true }))
        .toHaveStyle({ color: red });
    },
    async showsScheme(scheme: "light" | "dark") {
      await setScheme(scheme);
      await expect
        .poll(() => matchMedia(`(prefers-color-scheme: ${scheme})`).matches)
        .toBe(true);
      const root = document.documentElement;
      const surface = tokenColour(root, "--surface");
      const text = tokenColour(root, "--text");
      if (scheme === "light") {
        expect(surface).toBe("rgb(246, 246, 243)");
        expect(text).toBe("rgb(29, 29, 27)");
      } else {
        expect(surface).not.toBe("rgb(246, 246, 243)");
        expect(getComputedStyle(root).backgroundColor).toBe(surface);
        expect(getComputedStyle(root).color).toBe(text);
      }
      expect(contrastRatio(text, surface)).toBeGreaterThanOrEqual(4.5);
      const label = heading.element();
      expect(
        paintContrast(label, [getComputedStyle(label).color]),
      ).toBeGreaterThanOrEqual(4.5);
    },
    useViewport: resizeSettingsViewport,
  };
}

// Saving across servers and preserving the predecessor file are covered by
// ../../../e2e/configuration/system-settings-terminal-theme.spec.ts.
import { describe, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { TerminalThemeSource } from "../../src/terminalThemeSource.ts";
import type { TerminalThemeId } from "../../src/terminalThemes.ts";
import {
  enableSettingsTouch,
  settingsPhoneViewports,
} from "./system-settings-browser.ts";
import { mountTerminalThemeSettings } from "./system-settings-terminal-theme-page.ts";

const themeReply = (theme: TerminalThemeId) =>
  makeMe.aTerminalThemeSetting.with({ theme }).please();

test("terminal Light and Solarized samples keep their palette while settings chrome follows the system appearance", async () => {
  const preferences = await mountTerminalThemeSettings({
    read: () => Promise.resolve(themeReply("default")),
    save: (theme) => Promise.resolve(themeReply(theme)),
  });
  await preferences.showsReady();
  for (const [theme, label] of [
    ["light", "Light"],
    ["solarized-dark", "Solarized Dark"],
  ] as const) {
    await preferences.choose(theme);
    for (const scheme of ["dark", "light"] as const) {
      await preferences.showsScheme(scheme);
      await preferences.showsTheme(label);
    }
  }
});

const { portrait, landscape, reduced } = settingsPhoneViewports;

describe("phone terminal theme recovery", () => {
  test("touch reads the theme, keeps the saved theme shown after a refused save, and reaches Retry after rotation", async () => {
    const refusal = new Error(
      "The terminal theme could not be saved. Check the dashboard folder permissions and retry; the previous theme was kept.",
    );
    let refuseSolarized!: () => void;
    const pendingSolarized = new Promise<void>((resolve) => {
      refuseSolarized = resolve;
    }).then(() => {
      throw refusal;
    });
    const save = vi
      .fn<TerminalThemeSource["save"]>((theme) =>
        Promise.resolve(themeReply(theme)),
      )
      .mockResolvedValueOnce(themeReply("light"))
      .mockReturnValueOnce(pendingSolarized)
      .mockResolvedValueOnce(themeReply("solarized-dark"))
      .mockRejectedValueOnce(refusal)
      .mockResolvedValueOnce(themeReply("light"));
    await enableSettingsTouch();
    const preferences = await mountTerminalThemeSettings(
      {
        read: () => Promise.resolve(themeReply("default")),
        save,
      },
      portrait,
    );

    await preferences.readExplanation();
    await preferences.showsReady();
    await preferences.showsTheme("Default");
    await preferences.touchChoice("light");
    await preferences.showsReady();
    await preferences.showsTheme("Light");
    await preferences.useViewport(reduced);
    await preferences.touchChoice("solarized-dark");
    await preferences.showsSaving();
    refuseSolarized();
    await preferences.showsRefusal(refusal.message);
    await preferences.showsTheme("Light");
    await preferences.useViewport(landscape);
    await preferences.showsTheme("Light");
    await preferences.readRefusal();
    await preferences.touchRetry();
    await preferences.showsNoRefusal();
    await preferences.showsReady();
    await preferences.showsTheme("Solarized Dark");

    await preferences.useViewport(reduced);
    await preferences.touchChoice("light");
    await preferences.showsRefusal(refusal.message);
    await preferences.showsTheme("Solarized Dark");
    await preferences.useViewport(landscape);
    await preferences.showsTheme("Solarized Dark");
    await preferences.useViewport(reduced);
    await preferences.readRefusal();
    await preferences.touchRetry();
    await preferences.showsNoRefusal();
    await preferences.showsReady();
    await preferences.showsTheme("Light");
    await preferences.useViewport(portrait);
    await preferences.readSample();
    expect(save.mock.calls).toEqual([
      ["light"],
      ["solarized-dark"],
      ["solarized-dark"],
      ["light"],
      ["light"],
    ]);
  });
});

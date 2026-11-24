import { vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { DashboardSettingsSources } from "../../src/App.tsx";
import type { ProjectSettingsSource } from "../../src/projectSettingsSource.ts";
import { projectReplies } from "./system-settings-projects-page.ts";

export function settingsReplies(projects: Partial<ProjectSettingsSource> = {}) {
  const reply = {
    projects: { ...projectReplies(), ...projects },
    openAI: {
      read: () =>
        Promise.resolve(
          makeMe.anOpenAIConfigurationStatus
            .with({ configured: false })
            .please(),
        ),
      save: vi
        .fn<DashboardSettingsSources["openAI"]["save"]>()
        .mockRejectedValue(new Error("Unexpected OpenAI save")),
      remove: vi
        .fn<DashboardSettingsSources["openAI"]["remove"]>()
        .mockRejectedValue(new Error("Unexpected OpenAI remove")),
    },
    terminalTheme: {
      read: () =>
        Promise.resolve(
          makeMe.aTerminalThemeSetting.with({ theme: "default" }).please(),
        ),
      save: vi
        .fn<DashboardSettingsSources["terminalTheme"]["save"]>()
        .mockRejectedValue(new Error("Unexpected terminal theme save")),
    },
  } satisfies DashboardSettingsSources;
  return reply;
}

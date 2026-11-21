// Machine-local settings answers for frontend-only System settings journeys:
// the configured projects with their local facts, OpenAI status, terminal
// theme and feedback maintenance, kept as state that the page's accepted
// changes update the way the local dashboard server answers them
// (../../server/projectConfigurationBoundary.ts, ../../server/localJsonEndpoints.ts).

import type { Page, Route } from "@playwright/test";
import type { ConfiguredProject } from "../../server/projectConfiguration.ts";
import {
  projectAddEndpoint,
  projectRemoveEndpoint,
  projectSettingsEndpoint,
  projectVisibilityEndpoint,
  type ClientConfigurationInspection,
  type ProjectSettings,
} from "../../src/projectConfiguration.ts";
import {
  openAIConfigurationEndpoint,
  openAIRemoveEndpoint,
  openAISaveEndpoint,
} from "../../src/openAIConfiguration.ts";
import {
  terminalThemeEndpoint,
  terminalThemeSaveEndpoint,
} from "../../src/terminalThemeSetting.ts";
import type { TerminalThemeId } from "../../src/terminalThemes.ts";
import {
  feedbackMaintenanceEndpoint,
  type FeedbackMaintenanceSetting,
} from "../../src/feedbackMaintenanceSetting.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { fulfillJson } from "./frontendSubstituteAnswers.ts";

export { productionSeedProjects } from "../../server/projectConfigurationSeed.ts";

// What this machine's settings hold before the page changes them.
type FrontendSettingsMachine = {
  readonly projects: readonly ConfiguredProject[];
  readonly clientConfigurations?: Readonly<
    Record<string, ClientConfigurationInspection>
  >;
  // Whether an OpenAI API key is saved; none unless stated.
  readonly openAIConfigured?: boolean;
};

type Answer = { readonly status: number; readonly body: unknown };

const settingsEndpoints = [
  projectSettingsEndpoint,
  projectAddEndpoint,
  projectRemoveEndpoint,
  projectVisibilityEndpoint,
  openAIConfigurationEndpoint,
  openAISaveEndpoint,
  openAIRemoveEndpoint,
  terminalThemeEndpoint,
  terminalThemeSaveEndpoint,
  feedbackMaintenanceEndpoint,
];

// The published facts the page reads of a configured project; `hidden` only
// while it is hidden, as the server answers.
const published = (project: ConfiguredProject): PublishedSource => ({
  id: project.id,
  label: project.label,
  repository: project.repository,
  ref: project.ref,
  backlogPath: project.backlogPath,
  ...(project.hidden === true ? { hidden: true } : {}),
});

// Serves the machine's settings to `page` and keeps `services.projects`, which
// the page's project list reads, in step with accepted changes.
export async function installFrontendSettingsSubstitutes(
  page: Page,
  services: FrontendServiceState,
  machine: FrontendSettingsMachine,
): Promise<void> {
  let configured = [...machine.projects];
  let openAIConfigured = machine.openAIConfigured ?? false;
  let terminalTheme: TerminalThemeId = "default";
  const feedbackMaintenance: FeedbackMaintenanceSetting = { enabled: false };
  const publish = () => {
    Object.assign(services, {
      projects: configured.map(published),
    });
  };
  publish();
  const changed = (projects: readonly ConfiguredProject[]): Answer => {
    configured = [...projects];
    publish();
    return { status: 200, body: { projects: services.projects } };
  };
  const accept = (endpoint: string, body: Record<string, unknown>): Answer => {
    if (endpoint === projectSettingsEndpoint)
      return {
        status: 200,
        body: configured.map((project): ProjectSettings => ({
          id: project.id,
          localPath: project.localPath,
          clientConfiguration: machine.clientConfigurations?.[project.id] ?? {
            status: "absent",
          },
        })),
      };
    if (endpoint === projectAddEndpoint)
      return { status: 501, body: { error: "No project to add." } };
    if (endpoint === projectRemoveEndpoint)
      return changed(configured.filter((project) => project.id !== body["id"]));
    if (endpoint === projectVisibilityEndpoint)
      return changed(
        configured.map((project) =>
          project.id === body["id"]
            ? { ...project, hidden: body["hidden"] === true }
            : project,
        ),
      );
    if (endpoint === openAISaveEndpoint) openAIConfigured = true;
    if (endpoint === openAIRemoveEndpoint) openAIConfigured = false;
    if (
      endpoint === openAIConfigurationEndpoint ||
      endpoint === openAISaveEndpoint ||
      endpoint === openAIRemoveEndpoint
    )
      return { status: 200, body: { configured: openAIConfigured } };
    if (endpoint === terminalThemeSaveEndpoint)
      terminalTheme = body["theme"] as TerminalThemeId;
    if (
      endpoint === terminalThemeEndpoint ||
      endpoint === terminalThemeSaveEndpoint
    )
      return { status: 200, body: { theme: terminalTheme } };
    return { status: 200, body: feedbackMaintenance };
  };
  const answer = async (route: Route, endpoint: string) => {
    const request = route.request();
    const body =
      request.method() === "POST"
        ? (request.postDataJSON() as Record<string, unknown>)
        : {};
    const reply = accept(endpoint, body);
    await fulfillJson(route, reply.body, reply.status);
  };
  for (const endpoint of settingsEndpoints)
    await page.route(
      (url) => url.pathname === endpoint,
      (route) => answer(route, endpoint),
    );
}

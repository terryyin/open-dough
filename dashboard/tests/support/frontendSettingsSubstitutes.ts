// Machine-local settings answers for frontend-only System settings journeys:
// the configured projects with their local facts, OpenAI status, terminal
// theme and feedback maintenance, kept as state that the page's accepted
// changes update the way the local dashboard server answers them
// (../../server/projectConfigurationBoundary.ts, ../../server/localJsonEndpoints.ts).
// A test refuses or holds one answer to observe the page's recovery; every
// change the page posts stays inspectable in `changes`.

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

export { productionSeedProjects } from "../../server/projectConfigurationSeed.ts";

// What this machine's settings hold before the page changes them.
export type FrontendSettingsMachine = {
  readonly projects: readonly ConfiguredProject[];
  readonly clientConfigurations?: Readonly<
    Record<string, ClientConfigurationInspection>
  >;
  // The project an accepted Add answers with, at the local path it was given.
  readonly adding?: PublishedSource;
};

export type SettingsChange = {
  readonly endpoint: string;
  readonly body: unknown;
};

type Answer = { readonly status: number; readonly body: unknown };

// One answer the substitute computed when the page asked and delivers only
// once released.
export type HeldAnswer = {
  readonly received: Promise<void>;
  readonly delivered: Promise<void>;
  readonly release: () => void;
};

export type FrontendSettings = {
  // Every change the page posted to a settings endpoint, refused or not.
  readonly changes: readonly SettingsChange[];
  // The next request to `endpoint` is refused with `error` and changes nothing.
  readonly refuseNext: (
    endpoint: string,
    status: number,
    error: string,
    field?: string,
  ) => void;
  readonly holdNext: (endpoint: string) => HeldAnswer;
};

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
): Promise<FrontendSettings> {
  let configured = [...machine.projects];
  let openAIConfigured = false;
  let terminalTheme: TerminalThemeId = "default";
  const feedbackMaintenance: FeedbackMaintenanceSetting = { enabled: false };
  const changes: SettingsChange[] = [];
  const refusals = new Map<string, Answer>();
  const holds = new Map<
    string,
    {
      readonly received: () => void;
      readonly released: Promise<void>;
      readonly delivered: () => void;
    }
  >();
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
    if (endpoint === projectAddEndpoint) {
      if (machine.adding === undefined)
        return { status: 501, body: { error: "No project to add." } };
      const project = {
        ...machine.adding,
        localPath: String(body["localPath"]),
      };
      const answer = changed([...configured, project]);
      return {
        status: 200,
        body: { ...(answer.body as object), project: published(project) },
      };
    }
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
    if (request.method() === "POST") changes.push({ endpoint, body });
    const refusal = refusals.get(endpoint);
    refusals.delete(endpoint);
    const reply = refusal ?? accept(endpoint, body);
    const hold = holds.get(endpoint);
    holds.delete(endpoint);
    if (hold !== undefined) {
      hold.received();
      await hold.released;
    }
    await route.fulfill({
      status: reply.status,
      contentType: "application/json",
      body: JSON.stringify(reply.body),
    });
    hold?.delivered();
  };
  for (const endpoint of settingsEndpoints)
    await page.route(
      (url) => url.pathname === endpoint,
      (route) => answer(route, endpoint),
    );
  return {
    changes,
    refuseNext: (endpoint, status, error, field) => {
      refusals.set(endpoint, {
        status,
        body: field === undefined ? { error } : { error, field },
      });
    },
    holdNext: (endpoint) => {
      let received: () => void = () => undefined;
      let delivered: () => void = () => undefined;
      let release: () => void = () => undefined;
      const held: HeldAnswer = {
        received: new Promise<void>((resolve) => {
          received = resolve;
        }),
        delivered: new Promise<void>((resolve) => {
          delivered = resolve;
        }),
        release: () => {
          release();
        },
      };
      const released = new Promise<void>((resolve) => {
        release = resolve;
      });
      holds.set(endpoint, { received, released, delivered });
      return held;
    },
  };
}

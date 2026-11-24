import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ProjectsOnPage, useProjectConfiguration } from "./projectList.tsx";
import {
  ConfiguredDashboard,
  type DashboardSelection,
} from "./ConfiguredDashboard.tsx";
import { authenticatedPageReads, type PageReads } from "./pageReads.tsx";
import { SettingsGear } from "./DashboardBanner.tsx";
import { ProductMark } from "./ProductMark.tsx";
import { SystemSettings } from "./SystemSettings.tsx";
import {
  pageProjectSettingsSource,
  type ProjectSettingsSource,
} from "./projectSettingsSource.ts";
import { SettingsNavigation } from "./settingsNavigation.ts";
import { SavedTerminalThemeProvider } from "./savedTerminalTheme.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  pageTerminalThemeSource,
  type TerminalThemeSource,
} from "./terminalThemeSource.ts";
import {
  pageOpenAIConfigurationSource,
  type OpenAIConfigurationSource,
} from "./openAIConfigurationSource.ts";

export type DashboardSettingsSources = {
  readonly projects: ProjectSettingsSource;
  readonly openAI: OpenAIConfigurationSource;
  readonly terminalTheme: TerminalThemeSource;
};

export function App() {
  const configuration = useProjectConfiguration();
  return (
    <DashboardApplication
      configuration={configuration}
      reads={authenticatedPageReads}
      settingsSources={{
        projects: pageProjectSettingsSource,
        openAI: pageOpenAIConfigurationSource,
        terminalTheme: pageTerminalThemeSource,
      }}
    />
  );
}

export function DashboardApplication({
  configuration: { projects, problem, replaceProjects },
  reads,
  settingsSources,
}: {
  readonly configuration: {
    readonly projects: readonly PublishedSource[] | undefined;
    readonly problem: string | undefined;
    readonly replaceProjects: (projects: readonly PublishedSource[]) => void;
  };
  readonly reads: PageReads;
  readonly settingsSources: DashboardSettingsSources;
}) {
  const [settings, setSettings] = useState(
    () =>
      new URLSearchParams(window.location.search).get("view") === "settings",
  );
  const [selected, setSelected] = useState<string>();
  const dashboard = useRef<DashboardSelection | undefined>(undefined);
  const dashboardView = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | undefined>(undefined);
  const wasSettings = useRef(settings);
  const returnToLaunch = useRef<(() => void) | undefined>(undefined);
  const openSettings = () => {
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : undefined;
    setSelected(dashboard.current?.source?.id);
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "roster") params.set("returnView", "roster");
    params.set("view", "settings");
    window.history.pushState({ fromDashboard: true }, "", `/?${params}`);
    setSettings(true);
  };
  const back = () => {
    const state: unknown = window.history.state;
    if (
      typeof state === "object" &&
      state !== null &&
      "fromDashboard" in state &&
      state.fromDashboard === true
    )
      window.history.back();
    else {
      const params = new URLSearchParams(window.location.search);
      if (params.get("returnView") === "roster") params.set("view", "roster");
      else params.delete("view");
      params.delete("returnView");
      window.history.replaceState(null, "", params.size ? `/?${params}` : "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };
  useEffect(() => {
    const onPop = () => {
      setSettings(
        new URLSearchParams(window.location.search).get("view") === "settings",
      );
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
    };
  }, []);
  useLayoutEffect(() => {
    const returning = wasSettings.current && !settings;
    wasSettings.current = settings;
    if (!returning) return;
    if (returnToLaunch.current) {
      const resume = returnToLaunch.current;
      returnToLaunch.current = undefined;
      resume();
      return;
    }
    // A restored story destination may already have placed the keyboard.
    if (dashboardView.current?.contains(document.activeElement)) return;
    const destination = opener.current?.isConnected
      ? opener.current
      : document.querySelector<HTMLElement>(
          "button[aria-label='System settings']",
        );
    destination?.focus();
  }, [settings]);
  if (projects === undefined)
    return (
      <p role="status" className="frame-state">
        {problem ?? "Loading projects…"}
      </p>
    );
  return (
    <SavedTerminalThemeProvider source={settingsSources.terminalTheme}>
      <ProjectsOnPage projects={projects} replaceProjects={replaceProjects}>
        <SettingsNavigation.Provider
          value={(onReturn) => {
            returnToLaunch.current = onReturn;
            openSettings();
          }}
        >
          <div hidden={settings} ref={dashboardView}>
            {projects.length === 0 ? (
              <>
                <header className="banner">
                  <ProductMark />
                  <SettingsGear onOpen={openSettings} />
                </header>
                <main className="frame-state">
                  <h1>No projects configured</h1>
                  <p>
                    Open System settings → Projects to add a project and see its
                    published work and start sessions.
                  </p>
                </main>
              </>
            ) : (
              <ConfiguredDashboard
                reads={reads}
                settingsOpen={settings}
                onOpenSettings={openSettings}
                onDashboardReady={(value) => {
                  if (dashboard.current?.source?.id !== value.source?.id)
                    setSelected(value.source?.id);
                  dashboard.current = value;
                }}
              />
            )}
          </div>
          {settings && (
            <SystemSettings
              projectSettings={settingsSources.projects}
              openAISettings={settingsSources.openAI}
              selectedId={selected ?? dashboard.current?.source?.id}
              onSelect={(source) => {
                dashboard.current?.select(source);
                setSelected(source?.id);
              }}
              onBack={back}
            />
          )}
        </SettingsNavigation.Provider>
      </ProjectsOnPage>
    </SavedTerminalThemeProvider>
  );
}

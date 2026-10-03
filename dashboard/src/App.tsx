import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ProjectsOnPage, useProjectConfiguration } from "./projectList.tsx";
import {
  ConfiguredDashboard,
  type DashboardSelection,
} from "./ConfiguredDashboard.tsx";
import { SystemSettings } from "./SystemSettings.tsx";

export function App() {
  const { projects, problem, replaceProjects } = useProjectConfiguration();
  const [settings, setSettings] = useState(
    () =>
      new URLSearchParams(window.location.search).get("view") === "settings",
  );
  const [selected, setSelected] = useState<string>();
  const dashboard = useRef<DashboardSelection | undefined>(undefined);
  const opener = useRef<HTMLElement | undefined>(undefined);
  const wasSettings = useRef(settings);
  const openSettings = () => {
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : undefined;
    setSelected(dashboard.current?.source.id);
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
    if (wasSettings.current && !settings) {
      const destination = opener.current?.isConnected
        ? opener.current
        : document.querySelector<HTMLElement>(
            "button[aria-label='System settings']",
          );
      destination?.focus();
    }
    wasSettings.current = settings;
  }, [settings]);
  if (projects === undefined)
    return <p role="status">{problem ?? "Loading projects…"}</p>;
  return (
    <ProjectsOnPage projects={projects} replaceProjects={replaceProjects}>
      <div hidden={settings}>
        {projects.length === 0 ? (
          <>
            <header className="banner">
              <button
                type="button"
                aria-label="System settings"
                onClick={openSettings}
              >
                System settings
              </button>
            </header>
            <main className="page-header">
              <h1>No projects configured</h1>
              <p>
                Open System settings → Projects to add a project and see its
                published work and start sessions.
              </p>
            </main>
          </>
        ) : (
          <ConfiguredDashboard
            settingsOpen={settings}
            onOpenSettings={openSettings}
            onDashboardReady={(value) => {
              if (dashboard.current?.source.id !== value.source.id)
                setSelected(value.source.id);
              dashboard.current = value;
            }}
          />
        )}
      </div>
      {settings && (
        <SystemSettings
          selectedId={selected ?? dashboard.current?.source.id}
          onSelect={(source) => {
            dashboard.current?.select(source);
            setSelected(source.id);
          }}
          onBack={back}
        />
      )}
    </ProjectsOnPage>
  );
}

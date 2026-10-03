// Routing for dashboard project and view. Routes use query parameters on /
// (?project=<id>&view=<stories|roster>) so they work without server path fallbacks.

import { useEffect, useRef, useState } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { firstProject, useProjects } from "./projectList.tsx";

export type DashboardView = "stories" | "roster";

export type DashboardRoute = {
  readonly source: PublishedSource;
  readonly view: DashboardView;
};

export function buildRouteUrl(
  projectId: string,
  view: DashboardView,
  projects: readonly PublishedSource[],
): string {
  const defaultSource = firstProject(projects);
  const params = new URLSearchParams();
  if (projectId !== defaultSource.id || view === "roster") {
    params.set("project", projectId);
  }
  if (view === "roster") {
    params.set("view", "roster");
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function parseRoute(
  location: { search: string },
  projects: readonly PublishedSource[],
): {
  readonly route: DashboardRoute;
  readonly normalizedUrl: string | undefined;
} {
  const defaultSource = firstProject(projects);
  const params = new URLSearchParams(location.search);
  const projectParam = params.get("project");
  const requestedView = params.get("view");
  const viewParam =
    requestedView === "settings" ? params.get("returnView") : requestedView;

  const validSource =
    projectParam !== null
      ? projects.find((project) => project.id === projectParam)
      : defaultSource;
  const isInvalidProject = projectParam !== null && validSource === undefined;

  // An invalid project route resolves to the default project's stories and normalizes its URL.
  if (isInvalidProject) {
    return {
      route: { source: defaultSource, view: "stories" },
      normalizedUrl: buildRouteUrl(defaultSource.id, "stories", projects),
    };
  }

  const source = validSource ?? defaultSource;
  const view: DashboardView = viewParam === "roster" ? "roster" : "stories";
  const isInvalidView =
    viewParam !== null && viewParam !== "roster" && viewParam !== "stories";

  return {
    route: { source, view },
    normalizedUrl: isInvalidView
      ? buildRouteUrl(source.id, view, projects)
      : undefined,
  };
}

export function isFromPortrait(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    "fromPortrait" in state &&
    state.fromPortrait === true
  );
}

export function useDashboardRoute({
  sourceId,
  suspended = false,
  selectSource,
  onReturnToStories,
  onForwardToRoster,
}: {
  sourceId: string;
  suspended?: boolean;
  selectSource: (next: PublishedSource) => void;
  onReturnToStories: () => void;
  onForwardToRoster: (targetSourceId: string) => void;
}) {
  const projects = useProjects();
  const initial = useRef(parseRoute(window.location, projects));
  if (!suspended && initial.current.normalizedUrl !== undefined) {
    window.history.replaceState(null, "", initial.current.normalizedUrl);
    initial.current = { ...initial.current, normalizedUrl: undefined };
  }
  const [route, setRoute] = useState<DashboardRoute>(initial.current.route);
  const settingsSelection = useRef<PublishedSource | undefined>(undefined);

  const selectProject = (next: PublishedSource) => {
    if (next.id === sourceId) {
      return;
    }
    const nextUrl = buildRouteUrl(next.id, route.view, projects);
    if (!suspended) window.history.pushState(null, "", nextUrl);
    else {
      settingsSelection.current = next;
      const params = new URLSearchParams(window.location.search);
      params.set("project", next.id);
      window.history.replaceState(window.history.state, "", `/?${params}`);
    }
    setRoute({ source: next, view: route.view });
    selectSource(next);
  };

  const openRoster = (source: PublishedSource) => {
    setRoute({ source, view: "roster" });
    const nextUrl = buildRouteUrl(source.id, "roster", projects);
    window.history.pushState({ fromPortrait: true }, "", nextUrl);
  };

  // Shows a project's stories, from either view and whichever project is
  // selected, as one history entry, as the roster's Back does and a sidebar
  // entry does; nothing when they are already shown.
  const showStories = (next: PublishedSource) => {
    if (next.id === sourceId && route.view === "stories") {
      return;
    }
    window.history.pushState(
      null,
      "",
      buildRouteUrl(next.id, "stories", projects),
    );
    setRoute({ source: next, view: "stories" });
    selectSource(next);
  };

  const onPopStateRef = useRef<() => void>(() => {});
  onPopStateRef.current = () => {
    if (new URLSearchParams(window.location.search).get("view") === "settings")
      return;
    const savedSelection = settingsSelection.current;
    if (
      savedSelection &&
      projects.some((project) => project.id === savedSelection.id)
    ) {
      window.history.replaceState(
        null,
        "",
        buildRouteUrl(savedSelection.id, route.view, projects),
      );
    }
    settingsSelection.current = undefined;
    const parsed = parseRoute(window.location, projects);
    if (parsed.normalizedUrl) {
      window.history.replaceState(null, "", parsed.normalizedUrl);
    }
    const nextRoute = parsed.route;
    const targetSource = nextRoute.source;
    const targetView = nextRoute.view;

    if (targetView !== route.view) {
      if (targetView === "stories" && route.view === "roster") {
        onReturnToStories();
      } else if (targetView === "roster" && route.view === "stories") {
        onForwardToRoster(targetSource.id);
      }
      setRoute(nextRoute);
    } else if (nextRoute.source.id !== route.source.id) {
      setRoute(nextRoute);
    }

    if (targetSource.id !== sourceId) {
      selectSource(targetSource);
    }
  };

  useEffect(() => {
    // Keep one subscription while the app opens/closes its global view. A
    // synchronous render in another popstate listener must not remove ours
    // before this same event reaches it.
    const onPopState = () => {
      onPopStateRef.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return {
    route,
    selectProject,
    openRoster,
    showStories,
  };
}

// Routing for dashboard project and view. Routes use query parameters on /
// (?project=<id>&view=<stories|roster>) so they work without server path fallbacks.

import { useEffect, useRef, useState } from "react";
import {
  defaultSource,
  sourceById,
  type PublishedSource,
} from "./publishedSource.ts";

export type DashboardView = "stories" | "roster";

export type DashboardRoute = {
  readonly source: PublishedSource;
  readonly view: DashboardView;
};

export function buildRouteUrl(projectId: string, view: DashboardView): string {
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

export function parseRoute(location: { search: string }): {
  readonly route: DashboardRoute;
  readonly normalizedUrl: string | undefined;
} {
  const params = new URLSearchParams(location.search);
  const projectParam = params.get("project");
  const viewParam = params.get("view");

  const validSource =
    projectParam !== null ? sourceById(projectParam) : defaultSource;
  const isInvalidProject = projectParam !== null && validSource === undefined;

  // An invalid project route resolves to the default project's stories and normalizes its URL.
  if (isInvalidProject) {
    return {
      route: { source: defaultSource, view: "stories" },
      normalizedUrl: buildRouteUrl(defaultSource.id, "stories"),
    };
  }

  const source = validSource ?? defaultSource;
  const view: DashboardView = viewParam === "roster" ? "roster" : "stories";
  const isInvalidView =
    viewParam !== null && viewParam !== "roster" && viewParam !== "stories";

  return {
    route: { source, view },
    normalizedUrl: isInvalidView ? buildRouteUrl(source.id, view) : undefined,
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
  selectSource,
  onReturnToStories,
  onForwardToRoster,
}: {
  sourceId: string;
  selectSource: (next: PublishedSource) => void;
  onReturnToStories: () => void;
  onForwardToRoster: (targetSourceId: string) => void;
}) {
  const initial = useRef(parseRoute(window.location));
  if (initial.current.normalizedUrl !== undefined) {
    window.history.replaceState(null, "", initial.current.normalizedUrl);
  }
  const [route, setRoute] = useState<DashboardRoute>(initial.current.route);

  const selectProject = (next: PublishedSource) => {
    if (next.id === sourceId) {
      return;
    }
    const nextUrl = buildRouteUrl(next.id, route.view);
    window.history.pushState(null, "", nextUrl);
    setRoute({ source: next, view: route.view });
    selectSource(next);
  };

  const openRoster = (source: PublishedSource) => {
    setRoute({ source, view: "roster" });
    const nextUrl = buildRouteUrl(source.id, "roster");
    window.history.pushState({ fromPortrait: true }, "", nextUrl);
  };

  // Shows a project's stories, from either view and whichever project is
  // selected, as one history entry, as the roster's Back does and a sidebar
  // entry does; nothing when they are already shown.
  const showStories = (next: PublishedSource) => {
    if (next.id === sourceId && route.view === "stories") {
      return;
    }
    window.history.pushState(null, "", buildRouteUrl(next.id, "stories"));
    setRoute({ source: next, view: "stories" });
    selectSource(next);
  };

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseRoute(window.location);
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

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [route, sourceId, selectSource, onReturnToStories, onForwardToRoster]);

  return {
    route,
    selectProject,
    openRoster,
    showStories,
  };
}

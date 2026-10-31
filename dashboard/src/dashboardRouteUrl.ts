// The dashboard route's address: project, perspective and Development's view
// as query parameters on / (?project=<id>&view=<stories|roster>&perspective=intent)
// so they work without server path fallbacks. The perspective is presentation
// state over the selected project, independent of Development's view: Intent
// keeps the view Development returns to, and a project change keeps both.

import type { PublishedSource } from "./publishedSource.ts";
import { firstProject } from "./projectList.tsx";
import {
  storyDestinationOf,
  type StoryDestination,
} from "./dashboardDestination.ts";

export type DashboardView = "stories" | "roster";

// Development, the first-visit default, or Intent.
export type DashboardPerspective = "development" | "intent";

export type DashboardRoute = {
  readonly source: PublishedSource;
  readonly view: DashboardView;
  readonly perspective: DashboardPerspective;
  readonly story?: StoryDestination;
};

// The address of a route; a story destination is not part of it.
export function buildRouteUrl(
  { source, view, perspective }: Omit<DashboardRoute, "story">,
  projects: readonly PublishedSource[],
): string {
  const defaultSource = firstProject(projects);
  const params = new URLSearchParams();
  if (source.id !== defaultSource.id || view === "roster") {
    params.set("project", source.id);
  }
  if (view === "roster") {
    params.set("view", "roster");
  }
  if (perspective === "intent") {
    params.set("perspective", "intent");
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
  const requestedPerspective = params.get("perspective");
  const story = storyDestinationOf(params);
  // A story URL always names its project and Development's stories view. Retain an unknown
  // project verbatim so the page can explain that destination, never silently
  // turn a notification into a different project's work.
  if (story !== undefined) {
    return {
      route: {
        source:
          projects.find((source) => source.id === story.project) ??
          defaultSource,
        view: "stories",
        perspective: "development",
        story,
      },
      normalizedUrl: undefined,
    };
  }
  const perspective: DashboardPerspective =
    requestedPerspective === "intent" ? "intent" : "development";
  const isInvalidPerspective =
    requestedPerspective !== null && requestedPerspective !== perspective;
  const viewParam =
    requestedView === "settings" ? params.get("returnView") : requestedView;

  const validSource =
    projectParam !== null
      ? projects.find((project) => project.id === projectParam)
      : defaultSource;
  const isInvalidProject = projectParam !== null && validSource === undefined;

  // An invalid project route resolves to the default project's stories and normalizes its URL.
  if (isInvalidProject) {
    const route = {
      source: defaultSource,
      view: "stories",
      perspective,
    } as const;
    return { route, normalizedUrl: buildRouteUrl(route, projects) };
  }

  const source = validSource ?? defaultSource;
  const view: DashboardView = viewParam === "roster" ? "roster" : "stories";
  const isInvalidView =
    viewParam !== null && viewParam !== "roster" && viewParam !== "stories";

  const route = { source, view, perspective };
  return {
    route,
    normalizedUrl:
      isInvalidView || isInvalidPerspective
        ? buildRouteUrl(route, projects)
        : undefined,
  };
}

import { useLayoutEffect, useRef } from "react";
import { Settings } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { keepHeight } from "./measuredHeight.ts";
import { ProductMark } from "./ProductMark.tsx";
import { ProjectSelect } from "./ProjectSelect.tsx";
import { PerspectiveSelect } from "./PerspectiveSelect.tsx";
import type { DashboardPerspective } from "./dashboardRouteUrl.ts";
import { SessionsButton } from "./SessionsSidebar.tsx";
import type { PublishedSource } from "./publishedSource.ts";

export function DashboardBanner({
  source,
  perspective,
  onOpenSettings,
  onSelect,
  onSelectPerspective,
}: {
  readonly source: PublishedSource;
  readonly perspective: DashboardPerspective;
  readonly onOpenSettings: () => void;
  readonly onSelect: (next: PublishedSource) => void;
  readonly onSelectPerspective: (next: DashboardPerspective) => void;
}) {
  const banner = useRef<HTMLElement>(null);

  // Keep the banner footprint available to layout measurements.
  useLayoutEffect(() => {
    const element = banner.current;
    if (!element) return;
    const { stop } = keepHeight(
      element,
      document.documentElement,
      "--banner-height",
    );
    return stop;
  }, []);

  return (
    <header className="banner" ref={banner}>
      <ProductMark />
      <SessionsButton />
      <PerspectiveSelect
        perspective={perspective}
        onSelect={onSelectPerspective}
      />
      <ProjectSelect source={source} onSelect={onSelect} />
      <h1 className="project-title">{source.label}</h1>
      <SettingsGear onOpen={onOpenSettings} />
    </header>
  );
}

// The entry to System settings: the gear at the far end of the banner, on
// the dashboard and on the page shown while no project is configured.
export function SettingsGear({ onOpen }: { readonly onOpen: () => void }) {
  return (
    <IconButton
      label="System settings"
      icon={Settings}
      align="end"
      groupClassName="settings-control"
      onClick={onOpen}
    />
  );
}

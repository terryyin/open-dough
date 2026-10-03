import { useLayoutEffect, useRef } from "react";
import { Settings } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { keepHeight } from "./measuredHeight.ts";
import { ProjectSelect } from "./ProjectSelect.tsx";
import { SessionsButton } from "./SessionSidebar.tsx";
import { SourceStatus } from "./SourceStatus.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";

export function DashboardBanner({
  source,
  work,
  onOpenSettings,
  onSelect,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly onOpenSettings: () => void;
  readonly onSelect: (next: PublishedSource) => void;
}) {
  const banner = useRef<HTMLElement>(null);

  // Reflow changes the pinned banner's height. Reserve its actual footprint
  // for keyboard focus and stage headings, including at browser zoom.
  useLayoutEffect(() => {
    const element = banner.current;
    if (!element) return;
    const { measure, stop } = keepHeight(
      element,
      document.documentElement,
      "--banner-height",
    );
    // Native focus scrolling can run before the resize observer reports a
    // just-closed disclosure. Give that scroll the current footprint now.
    document.addEventListener("focusin", measure, true);
    return () => {
      document.removeEventListener("focusin", measure, true);
      stop();
    };
  }, []);

  return (
    <header className="banner" ref={banner}>
      <SessionsButton />
      <ProjectSelect source={source} onSelect={onSelect} />
      <SourceStatus source={source} work={work} />
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

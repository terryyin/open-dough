import { useLayoutEffect, useRef } from "react";
import { ProjectSelect } from "./ProjectSelect.tsx";
import { SourceStatus } from "./SourceStatus.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";

export function DashboardBanner({
  source,
  work,
  reading,
  failed,
  onSelect,
  onRefresh,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly reading: boolean;
  readonly failed: boolean;
  readonly onSelect: (next: PublishedSource) => void;
  readonly onRefresh: () => void;
}) {
  const banner = useRef<HTMLElement>(null);

  // Reflow changes the pinned banner's height. Reserve its actual footprint
  // for keyboard focus and stage headings, including at browser zoom.
  useLayoutEffect(() => {
    const element = banner.current;
    if (!element) return;
    const measure = () => {
      document.documentElement.style.setProperty(
        "--banner-height",
        `${element.getBoundingClientRect().height}px`,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // Native focus scrolling can run before the resize observer reports a
    // just-closed disclosure. Give that scroll the current footprint now.
    document.addEventListener("focusin", measure, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", measure, true);
      document.documentElement.style.removeProperty("--banner-height");
    };
  }, []);

  return (
    <header className="banner" ref={banner}>
      <ProjectSelect source={source} onSelect={onSelect} />
      <SourceStatus
        source={source}
        work={work}
        reading={reading}
        failed={failed}
        onRefresh={onRefresh}
      />
    </header>
  );
}

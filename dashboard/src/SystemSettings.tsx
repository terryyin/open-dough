import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FeedbackMaintenanceSettings } from "./FeedbackMaintenanceSettings.tsx";
import { Icon } from "./Icon.tsx";
import { OpenAISettings } from "./OpenAISettings.tsx";
import { ProductMark } from "./ProductMark.tsx";
import { ProjectsSettings } from "./ProjectsSettings.tsx";
import { SystemSettingsUsage } from "./SystemSettingsUsage.tsx";
import { TerminalThemeSettings } from "./TerminalThemeSettings.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { pageUsageSource } from "./usageSource.ts";
import "./frame-controls.css";
import "./project-configuration.css";

// System settings' separate views: the existing settings together as General,
// and Usage.
const views = [
  ["general", "General"],
  ["usage", "Usage"],
] as const;
type SettingsView = (typeof views)[number][0];

export function SystemSettings({
  selectedId,
  onSelect,
  onBack,
}: {
  readonly selectedId: string | undefined;
  readonly onSelect: (source: PublishedSource | undefined) => void;
  readonly onBack: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [view, setView] = useState<SettingsView>("general");
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <main className="system-settings">
      <div className="settings-bar">
        <div className="settings-title">
          <ProductMark />
          <h1 ref={heading} tabIndex={-1}>
            System settings
          </h1>
        </div>
        <button type="button" className="frame-button" onClick={onBack}>
          <Icon icon={ArrowLeft} />
          Back to dashboard
        </button>
      </div>
      <nav className="settings-views" aria-label="System settings views">
        {views.map(([id, name]) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => {
              setView(id);
            }}
          >
            {name}
          </button>
        ))}
      </nav>
      {view === "general" ? (
        <>
          <ProjectsSettings selectedId={selectedId} onSelect={onSelect} />
          <OpenAISettings />
          <TerminalThemeSettings />
          <FeedbackMaintenanceSettings />
        </>
      ) : (
        <SystemSettingsUsage source={pageUsageSource} />
      )}
    </main>
  );
}

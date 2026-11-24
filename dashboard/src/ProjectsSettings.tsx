// System settings → General's Projects: each project this dashboard
// configures on this machine, with its checkout, its Client configuration,
// and its visibility and removal.
import { useEffect, useState } from "react";
import { AddProject } from "./AddProject.tsx";
import { ProjectClientConfiguration } from "./ProjectClientConfiguration.tsx";
import { ProjectVisibility } from "./ProjectVisibility.tsx";
import { RemoveProject } from "./RemoveProject.tsx";
import { useProjects } from "./projectList.tsx";
import type { ProjectSettings } from "./projectConfiguration.ts";
import type { ProjectSettingsSource } from "./projectSettingsSource.ts";
import type { PublishedSource } from "./publishedSource.ts";

export function ProjectsSettings({
  source: settings,
  selectedId,
  onSelect,
}: {
  readonly source: ProjectSettingsSource;
  readonly selectedId: string | undefined;
  readonly onSelect: (source: PublishedSource | undefined) => void;
}) {
  const projects = useProjects();
  const [facts, setFacts] = useState<readonly ProjectSettings[]>();
  const [problem, setProblem] = useState<string>();
  const [visibilityProblem, setVisibilityProblem] = useState<string>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setProblem(undefined);
    void settings.read(controller.signal).then(setFacts, (error: unknown) => {
      if (!controller.signal.aborted)
        setProblem(error instanceof Error ? error.message : String(error));
    });
    return () => {
      controller.abort();
    };
  }, [projects, retry, settings]);
  return (
    <section
      className="settings-section"
      aria-labelledby="settings-projects-heading"
    >
      <div className="settings-section-heading">
        <h2 id="settings-projects-heading">Projects</h2>
        <AddProject add={settings.add} onSelect={onSelect} />
      </div>
      <p className="settings-note">
        Configure projects for this dashboard on this machine.
      </p>
      {problem && (
        <div role="alert" className="settings-problem">
          {problem}{" "}
          <button
            type="button"
            className="frame-button"
            onClick={() => {
              setRetry(retry + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
      {visibilityProblem && (
        <div role="alert" className="settings-problem">
          {visibilityProblem}
        </div>
      )}
      {projects.length === 0 ? (
        <p className="settings-empty">
          No projects configured. Add a project to get started.
        </p>
      ) : (
        <ul className="settings-project-list">
          {projects.map((source) => {
            const projectFacts = facts?.find((item) => item.id === source.id);
            return (
              <li
                key={source.id}
                data-project-visibility={source.hidden ? "hidden" : "visible"}
              >
                <div>
                  <div className="settings-project-title">
                    <h3>{source.label}</h3>
                    {source.hidden && (
                      <p className="settings-project-status">
                        Hidden from dashboard
                      </p>
                    )}
                  </div>
                  <dl>
                    <dt>GitHub repository</dt>
                    <dd>{source.repository}</dd>
                    <dt>Execution checkout</dt>
                    <dd>{projectFacts?.localPath ?? "Loading…"}</dd>
                    <ProjectClientConfiguration
                      inspection={projectFacts?.clientConfiguration}
                    />
                  </dl>
                </div>
                <div className="settings-project-actions">
                  <ProjectVisibility
                    source={source}
                    setHidden={settings.setHidden}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onProblem={setVisibilityProblem}
                  />
                  <RemoveProject
                    source={source}
                    remove={settings.remove}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

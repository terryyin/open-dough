import { useEffect, useRef, useState } from "react";
import { OpenAISettings } from "./OpenAISettings.tsx";
import { TerminalThemeSettings } from "./TerminalThemeSettings.tsx";
import { refusalMessage } from "./refusalMessage.ts";
import { AddProject } from "./AddProject.tsx";
import { RemoveProject } from "./RemoveProject.tsx";
import { useProjects } from "./projectList.tsx";
import {
  projectSettingsEndpoint,
  type ProjectSettings,
} from "./projectConfiguration.ts";
import type { PublishedSource } from "./publishedSource.ts";
import "./project-configuration.css";

export function SystemSettings({
  selectedId,
  onSelect,
  onBack,
}: {
  readonly selectedId: string | undefined;
  readonly onSelect: (source: PublishedSource) => void;
  readonly onBack: () => void;
}) {
  const projects = useProjects();
  const heading = useRef<HTMLHeadingElement>(null);
  const [facts, setFacts] = useState<readonly ProjectSettings[]>();
  const [problem, setProblem] = useState<string>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setProblem(undefined);
    void fetch(projectSettingsEndpoint, { signal: controller.signal })
      .then(async (response) => {
        const answer: unknown = await response.json();
        if (!response.ok)
          throw new Error(
            refusalMessage(answer, "Project settings could not be read."),
          );
        return answer as readonly ProjectSettings[];
      })
      .then(setFacts, (error: unknown) => {
        if (!controller.signal.aborted)
          setProblem(error instanceof Error ? error.message : String(error));
      });
    return () => {
      controller.abort();
    };
  }, [projects, retry]);
  return (
    <main className="system-settings">
      <div className="settings-heading">
        <h1 ref={heading} tabIndex={-1}>
          System settings
        </h1>
        <button type="button" onClick={onBack}>
          Back to dashboard
        </button>
      </div>
      <section aria-labelledby="settings-projects-heading">
        <div className="settings-heading">
          <h2 id="settings-projects-heading">Projects</h2>
          <AddProject onSelect={onSelect} />
        </div>
        <p>Configure projects for this dashboard on this machine.</p>
        {problem && (
          <div role="alert">
            {problem}{" "}
            <button
              type="button"
              onClick={() => {
                setRetry(retry + 1);
              }}
            >
              Retry
            </button>
          </div>
        )}
        {projects.length === 0 ? (
          <p>No projects configured. Add a project to get started.</p>
        ) : (
          <ul className="settings-project-list">
            {projects.map((source) => (
              <li key={source.id}>
                <div>
                  <h3>{source.label}</h3>
                  <dl>
                    <dt>GitHub repository</dt>
                    <dd>{source.repository}</dd>
                    <dt>Local path</dt>
                    <dd>
                      {facts?.find((item) => item.id === source.id)
                        ?.localPath ?? "Loading…"}
                    </dd>
                  </dl>
                </div>
                <RemoveProject
                  source={source}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
      <OpenAISettings />
      <TerminalThemeSettings />
    </main>
  );
}

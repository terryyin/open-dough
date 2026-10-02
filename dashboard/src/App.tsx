import { ProjectsOnPage, useProjectConfiguration } from "./projectList.tsx";
import { ConfiguredDashboard } from "./ConfiguredDashboard.tsx";
import { AddProject } from "./AddProject.tsx";

export function App() {
  const { projects, problem, replaceProjects } = useProjectConfiguration();
  if (projects === undefined)
    return <p role="status">{problem ?? "Loading projects…"}</p>;
  return (
    <ProjectsOnPage projects={projects} replaceProjects={replaceProjects}>
      {projects.length === 0 ? (
        <main className="page-header">
          <h1>No projects configured</h1>
          <p>Add a project to see its published work and start sessions.</p>
          <AddProject autoFocus />
        </main>
      ) : (
        <ConfiguredDashboard />
      )}
    </ProjectsOnPage>
  );
}

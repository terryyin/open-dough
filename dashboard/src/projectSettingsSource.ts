import {
  projectAddEndpoint,
  projectRemoveEndpoint,
  projectSettingsEndpoint,
  projectVisibilityEndpoint,
  type AddedProject,
  type ProjectSettings,
} from "./projectConfiguration.ts";
import { ProjectInputProblem, type ProjectInput } from "./projectInput.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { refusalMessage } from "./refusalMessage.ts";

export type ProjectSettingsSource = {
  readonly read: (signal: AbortSignal) => Promise<readonly ProjectSettings[]>;
  readonly add: (draft: ProjectInput) => Promise<AddedProject>;
  readonly setHidden: (
    projectId: string,
    hidden: boolean,
  ) => Promise<readonly PublishedSource[]>;
  readonly remove: (projectId: string) => Promise<readonly PublishedSource[]>;
};

type ProjectChangeAnswer = Partial<AddedProject> & {
  readonly field?: unknown;
};

async function postProjectChange(
  endpoint: string,
  body: object,
  failure: string,
) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const answer = (await response.json()) as ProjectChangeAnswer | null;
    if (answer === null) throw new Error(failure);
    return { ok: response.ok, answer };
  } catch {
    throw new Error(failure);
  }
}

export const pageProjectSettingsSource: ProjectSettingsSource = {
  read: async (signal) => {
    const response = await fetch(projectSettingsEndpoint, { signal });
    const answer: unknown = await response.json();
    if (!response.ok)
      throw new Error(
        refusalMessage(answer, "Project settings could not be read."),
      );
    return answer as readonly ProjectSettings[];
  },
  add: async (draft) => {
    const failure =
      "The project could not be added. Check the local dashboard server and try again.";
    const { ok, answer } = await postProjectChange(
      projectAddEndpoint,
      draft,
      failure,
    );
    if (!ok) {
      const message = refusalMessage(answer, failure);
      if (answer.field === "githubUrl" || answer.field === "localPath")
        throw new ProjectInputProblem(answer.field, message);
      throw new Error(message);
    }
    if (answer.project === undefined || answer.projects === undefined)
      throw new Error(failure);
    return { project: answer.project, projects: answer.projects };
  },
  setHidden: async (id, hidden) => {
    const { ok, answer } = await postProjectChange(
      projectVisibilityEndpoint,
      { id, hidden },
      "The project visibility could not be updated. Check the local dashboard server and try again.",
    );
    if (!ok || answer.projects === undefined)
      throw new Error(
        refusalMessage(answer, "The project visibility could not be updated."),
      );
    return answer.projects;
  },
  remove: async (id) => {
    const failure =
      "The project could not be removed. Check the local dashboard server and try again.";
    const { ok, answer } = await postProjectChange(
      projectRemoveEndpoint,
      { id },
      failure,
    );
    if (!ok)
      throw new Error(
        refusalMessage(answer, "The project could not be removed."),
      );
    if (answer.projects === undefined) throw new Error(failure);
    return answer.projects;
  },
};

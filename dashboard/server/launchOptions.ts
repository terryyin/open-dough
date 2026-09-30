// The options a launch selects, checked at the local launch boundary
// (`./agentLaunchAdmission.ts`) against the definition the target project's
// installed skill carries (`../src/commandOptions.ts`), read through
// `installedSkillPath`. A request whose selection cannot be honored is
// refused with the flag or the reason, before any host process starts.

import { readFile } from "node:fs/promises";
import {
  launchKindName,
  launchWorkflows,
  type AgentLaunchRequest,
} from "../src/agentLaunch.ts";
import {
  inDefinitionOrder,
  optionsDefinitionSchema,
  selectionProblems,
  type OptionsDefinition,
} from "../src/commandOptions.ts";
import { installedSkillPath } from "./claudeWorkspace.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// A project's installed definition, or why there is none to select from.
export type ReadDefinition =
  | { readonly kind: "defined"; readonly definition: OptionsDefinition }
  | { readonly kind: "unavailable"; readonly why: string };

export async function readDefinition(
  project: ProjectFolder,
  skill: string,
  file: string,
): Promise<ReadDefinition> {
  let text: string;
  try {
    text = await readFile(
      installedSkillPath(project, skill, "references", file),
      "utf8",
    );
  } catch (error) {
    return {
      kind: "unavailable",
      why:
        (error as NodeJS.ErrnoException).code === "ENOENT"
          ? "has no options file"
          : "options file could not be read",
    };
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { kind: "unavailable", why: "options file is not valid" };
  }
  const parsed = optionsDefinitionSchema.safeParse(json);
  if (!parsed.success) {
    return { kind: "unavailable", why: "options file is not valid" };
  }
  return parsed.data.command === skill
    ? { kind: "defined", definition: parsed.data }
    : { kind: "unavailable", why: "options file defines another command" };
}

// The request with its selected flags in the definition's order, or the
// refusal: the workflow defines no options, the project's definition is
// unavailable, a flag is not one it defines, or flags share an exclusive
// group. A request with no selection is returned as it is.
export async function withSelectedOptions(
  request: AgentLaunchRequest,
  project: ProjectFolder,
): Promise<AgentLaunchRequest> {
  if (request.options === undefined || request.options.length === 0) {
    return request;
  }
  const spec =
    request.workflow === "ad-hoc"
      ? undefined
      : launchWorkflows[request.workflow];
  if (spec?.options === undefined) {
    throw new RefusedRequest(
      400,
      `${launchKindName(request.workflow)} has no options to select.`,
    );
  }
  const { skill } = spec;
  const read = await readDefinition(project, skill, spec.options);
  if (read.kind === "unavailable") {
    throw new RefusedRequest(
      400,
      `Options cannot be selected: the installed ${skill} skill in ${project.shown} ${read.why}.`,
    );
  }
  const [problem] = selectionProblems(read.definition, request.options);
  if (problem !== undefined) {
    const installed = `the installed ${skill} skill in ${project.shown}`;
    throw new RefusedRequest(
      400,
      problem.kind === "unknown"
        ? `Option ${problem.flag} is not one ${installed} defines.`
        : `Options ${problem.flags.join(" and ")} are in the same ${problem.group} group of ${installed}; select only one.`,
    );
  }
  return {
    ...request,
    options: inDefinitionOrder(read.definition, request.options),
  };
}

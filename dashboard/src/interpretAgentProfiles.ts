// Interprets the agent profiles listing the local boundary returned at a
// revision into the assignments this dashboard shows (`./agentAssignments.ts`).

import { z } from "zod";
import {
  agentHosts,
  agentIdentity,
  agentModes,
  agentRotationFor,
  parseAgentProfileFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { PublishedProfiles } from "./authenticatedProfileRead.ts";
import { attributionLoading } from "./assignmentAttribution.ts";
import type {
  AgentAssignment,
  ProfileAssignment,
  ProfileAssignments,
  ProjectRotation,
  UnreadableProfile,
} from "./agentAssignments.ts";

const agentMode = z.enum(agentModes);
const agentHost = z.enum(agentHosts);

const profileFacts = {
  name: z.string().min(1),
  identity: z.string().min(1),
  host: agentHost.optional(),
  model: z.string().min(1).optional(),
};

const readProfile = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    profile: z.discriminatedUnion("activity", [
      z.object({
        ...profileFacts,
        activity: z.literal("execution"),
        mode: agentMode,
        branch: z.string().min(1),
      }),
      z.object({ ...profileFacts, activity: z.literal("preparation") }),
    ]),
  }),
  z.object({ ok: z.literal(false), error: z.string().min(1) }),
]);

export function interpretProfiles({
  profiles,
  settings,
}: PublishedProfiles): ProfileAssignments {
  const assignments: ProfileAssignment[] = [];
  const unreadable: UnreadableProfile[] = [];
  for (const { path, text } of profiles) {
    const file = path.split("/").pop() ?? path;
    let raw: unknown;
    try {
      raw = parseAgentProfileFile(file, text);
    } catch (error) {
      raw = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
    const read = readProfile.safeParse(raw);
    if (!read.success) {
      unreadable.push({
        file,
        problem:
          "The shared profile reader answered in a shape this dashboard does not understand.",
      });
      continue;
    }
    if (!read.data.ok) {
      unreadable.push({ file, problem: read.data.error });
      continue;
    }
    const { profile } = read.data;
    const { name, identity, host, model } = profile;
    const facts: AgentAssignment = {
      profilePath: path,
      name,
      agent: agentIdentity(name).agent,
      host,
      model,
      human: attributionLoading,
    };
    if (profile.activity === "preparation") {
      assignments.push({ ...facts, activity: "preparation", identity });
    } else {
      const { activity, mode, branch } = profile;
      assignments.push({ ...facts, mode, branch, activity, identity });
    }
  }
  return {
    rotation: agentRotationFor(settings) as ProjectRotation,
    assignments,
    unreadable,
  };
}

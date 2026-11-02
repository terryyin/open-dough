// A project's deliberate proof-generation instruction, shared by settings
// parsing and the authenticated Intent answer. These are displayed as text;
// the dashboard never executes the command or invokes the skill.

import { z } from "zod";

const instruction = z.string().trim().min(1);

export const proofGeneration = z.union([
  z.object({ command: instruction }).strict(),
  z.object({ skill: instruction }).strict(),
]);

export type ProofGeneration = z.infer<typeof proofGeneration>;

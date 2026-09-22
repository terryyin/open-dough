// Typed projection of recorded Goal as purpose. Missing Goal is Not recorded.

import { z } from "zod";
import { readStoryPurpose } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-purpose.mjs";
import { ReadProblem } from "./readProblem";

const interpretedPurpose = z.discriminatedUnion("status", [
  z.object({ status: z.literal("not-recorded") }),
  z.object({ status: z.literal("recorded"), purpose: z.string().min(1) }),
]);

export type WorkPurpose =
  | { readonly status: "loading" }
  | { readonly status: "not-recorded" }
  | { readonly status: "unavailable"; readonly problem: string }
  | { readonly status: "recorded"; readonly purpose: string };

export function interpretStoryPurpose(
  source: string,
  href: string,
): Exclude<WorkPurpose, { readonly status: "loading" | "unavailable" }> {
  let raw: unknown;
  try {
    raw = readStoryPurpose(source, href);
  } catch (error) {
    const reported = error instanceof Error ? error.message : String(error);
    throw new ReadProblem(`The shared purpose reader reports: “${reported}”`);
  }
  const parsed = interpretedPurpose.safeParse(raw);
  if (!parsed.success) {
    throw new ReadProblem(
      "The shared purpose reader answered in a shape this dashboard does not understand.",
    );
  }
  if (parsed.data.status === "not-recorded") {
    return { status: "not-recorded" };
  }
  return { status: "recorded", purpose: parsed.data.purpose };
}

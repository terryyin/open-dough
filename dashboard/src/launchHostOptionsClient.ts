import type { HostIdentity } from "./hostDescription.ts";
import {
  launchHostOptionsEndpoint,
  launchHostOptionsSchema,
  type LaunchHostOptions,
} from "./launchHostOptions.ts";

export type ReadLaunchHostOptions = (request: {
  readonly source: string;
  readonly host: HostIdentity;
  readonly projectContext: boolean;
  readonly signal: AbortSignal;
}) => Promise<LaunchHostOptions>;

export const requestLaunchHostOptions: ReadLaunchHostOptions = async ({
  source,
  host,
  projectContext,
  signal,
}) => {
  const query = new URLSearchParams({
    source,
    host,
    ...(projectContext ? { context: "project" } : {}),
  });
  const response = await fetch(`${launchHostOptionsEndpoint}?${query}`, {
    signal,
  });
  if (!response.ok) throw new Error("Host model choices could not be read.");
  return launchHostOptionsSchema.parse(await response.json());
};

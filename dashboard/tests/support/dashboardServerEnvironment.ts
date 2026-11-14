// Compose one server's private fake GitHub, host and caller environments.
// Caller probes may add NODE_OPTIONS; they must retain the fake owner preload.
import path from "node:path";
import { requestOwnerEnvironmentAt } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import type { DashboardServerOptions } from "./dashboardServerOptions.ts";

export function dashboardServerEnvironment(
  options: DashboardServerOptions,
  ghEnv: Record<string, string>,
  claudeEnv: NodeJS.ProcessEnv,
  codex: { readonly binDir: string; readonly env: NodeJS.ProcessEnv },
  githubUrl: string,
): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ...ghEnv,
    ...claudeEnv,
    ...codex.env,
    PATH: [
      ...(options.pathPrefix ?? []),
      codex.binDir,
      claudeEnv["PATH"] ?? "",
    ].join(path.delimiter),
    DOUGH_AVATAR_ORIGIN: githubUrl.replace(/\/$/, ""),
    ...(options.requestOwnerRoot === undefined
      ? {}
      : requestOwnerEnvironmentAt(options.requestOwnerRoot)),
    ...options.extraEnv,
    NODE_OPTIONS: [
      ghEnv["NODE_OPTIONS"] ?? process.env["NODE_OPTIONS"],
      options.extraEnv?.["NODE_OPTIONS"],
    ]
      .filter(Boolean)
      .join(" "),
  };
}

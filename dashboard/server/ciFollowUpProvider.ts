// The flow owns allowance and retention; a provider owns CI evidence and work.
import type { PublishedSource } from "../src/publishedSource.ts";
import { adapterRepeatProvider } from "./ciFollowUpAdapterProvider.ts";
import { projectFolder } from "./projectFolders.ts";
import { githubRepeatProvider } from "./ciFollowUpGithubProvider.ts";
import type { ciConfiguration } from "./baseCiJudgment.ts";
import type { repeatDecisionOf } from "./ciFollowUpDecision.ts";
import type { RepeatRequest } from "./ciFollowUpStore.ts";

export type RepeatSubmission = {
  kind: "accepted" | "refused" | "uncertain";
  explanation: string;
  attempt?: { runId: string | number; attemptId: string | number; sha: string };
};

export type RepeatProvider = {
  preparationFailure: string;
  prepare(
    decision: NonNullable<ReturnType<typeof repeatDecisionOf>>,
    signal: AbortSignal,
  ): Promise<RepeatRequest | string>;
  submit(
    request: RepeatRequest,
    signal: AbortSignal,
  ): Promise<RepeatSubmission>;
  observe(
    request: RepeatRequest,
    signal: AbortSignal,
  ): Promise<RepeatRequest["outcome"]>;
};

export function configuredRepeatProvider(
  source: PublishedSource,
  configuration: ReturnType<typeof ciConfiguration>,
): RepeatProvider | undefined {
  if (configuration.adapter !== undefined)
    return configuration.rebuild === undefined
      ? undefined
      : adapterRepeatProvider(
          source,
          projectFolder(source).path,
          configuration.adapter,
          configuration.rebuild,
        );
  return githubRepeatProvider(source, configuration.workflow);
}

export function retainedRepeatProvider(
  source: PublishedSource,
  request: RepeatRequest,
): RepeatProvider {
  if (request.provider === "github")
    return githubRepeatProvider(source, request.workflow);
  return adapterRepeatProvider(source, projectFolder(source).path);
}

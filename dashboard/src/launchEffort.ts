// Known models constrain effort; an unknown inherited model is checked in the
// actual workspace at launch, without borrowing the catalog's recommendation.
import type { LaunchHostOptions } from "./launchHostOptions.ts";
export function launchEfforts(
  options: LaunchHostOptions | undefined,
  model: string,
) {
  const applicable = model || options?.configuredModel;
  const offering = options?.models.find((item) => item.model === applicable);
  const efforts =
    offering?.efforts ??
    Array.from(
      new Map(
        options?.models
          .flatMap((item) => item.efforts)
          .map((item) => [item.effort, item]),
      ).values(),
    );
  return { efforts, known: offering !== undefined };
}
export function effortBlocked(
  options: LaunchHostOptions | undefined,
  model: string,
  effort: string,
) {
  if (effort === "") return false;
  const choices = launchEfforts(options, model);
  return (
    options === undefined ||
    !choices.efforts.some((item) => item.effort === effort)
  );
}

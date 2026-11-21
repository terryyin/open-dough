// Each new dialog opens on the host's default effort, when it names one, and
// otherwise delegates settings until explicitly selected. Host or project
// changes reset both; catalog replies constrain choices without replacing them.
import { useEffect, useState } from "react";
import type { AgentLaunchRequest, LaunchModel } from "./agentLaunch.ts";
import type { LaunchHostOptions } from "./launchHostOptions.ts";
import type { ReadLaunchHostOptions } from "./launchHostOptionsClient.ts";
import { useLaunchHostOptions } from "./useLaunchHostOptions.ts";
import { effortBlocked } from "./launchEffort.ts";
import { hostDescription, launchHosts } from "./hostDescription.ts";

export function useLaunchSettings(
  readOptions: ReadLaunchHostOptions,
  sourceId: string,
  host: AgentLaunchRequest["host"],
  projectContext: boolean,
) {
  const [model, setModel] = useState<LaunchModel>("");
  const [effort, setEffort] = useState(() => initialEffort(host));
  useEffect(() => {
    setModel("");
    setEffort(initialEffort(host));
  }, [sourceId, host]);
  const catalog = useLaunchHostOptions(
    readOptions,
    sourceId,
    host,
    projectContext,
  );
  const settingsBlocked = launchSettingsBlocked(
    host,
    model,
    effort,
    catalog.options,
  );
  return { model, setModel, effort, setEffort, catalog, settingsBlocked };
}

function initialEffort(host: AgentLaunchRequest["host"]): string {
  return hostDescription(host).defaultEffort ?? "";
}

// A chosen model the host's catalog does not offer, or an effort the chosen
// model does not take for a host that offers effort here, cannot be started.
export function launchSettingsBlocked(
  host: AgentLaunchRequest["host"],
  model: LaunchModel,
  effort: string,
  options: LaunchHostOptions | undefined,
  effortHosts: readonly AgentLaunchRequest["host"][] = launchHosts,
): boolean {
  return (
    (hostDescription(host).modelCatalog !== undefined &&
      model !== "" &&
      !options?.models.some((item) => item.model === model)) ||
    (effortHosts.includes(host) && effortBlocked(options, model, effort, host))
  );
}

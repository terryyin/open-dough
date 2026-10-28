// Each new dialog delegates settings until explicitly selected. Host or project
// changes reset both; catalog replies constrain choices without replacing them.
import { useEffect, useState } from "react";
import type { AgentLaunchRequest, LaunchModel } from "./agentLaunch.ts";
import type { LaunchHostOptions } from "./launchHostOptions.ts";
import { useLaunchHostOptions } from "./useLaunchHostOptions.ts";
import { effortBlocked } from "./launchEffort.ts";
import { hostDescription } from "./hostDescription.ts";

export function useLaunchSettings(
  sourceId: string,
  host: AgentLaunchRequest["host"],
  projectContext: boolean,
) {
  const [model, setModel] = useState<LaunchModel>("");
  const [effort, setEffort] = useState("");
  useEffect(() => {
    setModel("");
    setEffort("");
  }, [sourceId, host]);
  const catalog = useLaunchHostOptions(sourceId, host, projectContext);
  const settingsBlocked = launchSettingsBlocked(
    host,
    model,
    effort,
    catalog.options,
  );
  return { model, setModel, effort, setEffort, catalog, settingsBlocked };
}

// A chosen model the host's catalog does not offer, or an effort the chosen
// model does not take for a host that offers effort here, cannot be started.
export function launchSettingsBlocked(
  host: AgentLaunchRequest["host"],
  model: LaunchModel,
  effort: string,
  options: LaunchHostOptions | undefined,
  effortHosts: readonly AgentLaunchRequest["host"][] = ["codex", "cursor"],
): boolean {
  return (
    (hostDescription(host).modelCatalog !== undefined &&
      model !== "" &&
      !options?.models.some((item) => item.model === model)) ||
    (effortHosts.includes(host) && effortBlocked(options, model, effort, host))
  );
}

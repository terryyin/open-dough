// Each new dialog delegates settings until explicitly selected. Host or project
// changes reset both; catalog replies constrain choices without replacing them.
import { useEffect, useState } from "react";
import type { AgentLaunchRequest, LaunchModel } from "./agentLaunch.ts";
import { useLaunchHostOptions } from "./useLaunchHostOptions.ts";
import { effortBlocked } from "./launchEffort.ts";

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
  const settingsBlocked =
    host === "codex" &&
    ((model !== "" &&
      !catalog.options?.models.some((item) => item.model === model)) ||
      effortBlocked(catalog.options, model, effort));
  return { model, setModel, effort, setEffort, catalog, settingsBlocked };
}

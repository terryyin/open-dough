import { useEffect, useState } from "react";
import {
  launchHostOptionsEndpoint,
  launchHostOptionsSchema,
  type LaunchHostOptions,
} from "./launchHostOptions.ts";
import { hostDescription, type HostIdentity } from "./hostDescription.ts";
export function useLaunchHostOptions(
  source: string,
  host: HostIdentity,
  projectContext = false,
) {
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{
    source: string;
    host: string;
    options?: LaunchHostOptions;
    error?: string;
  }>({ source, host });
  useEffect(() => {
    const modelCatalog = hostDescription(host).modelCatalog;
    if (modelCatalog === undefined) return;
    const controller = new AbortController();
    setState({ source, host });
    void fetch(
      `${launchHostOptionsEndpoint}?${new URLSearchParams({ source, host, ...(projectContext ? { context: "project" } : {}) })}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(modelCatalog.unreadable);
        const options = launchHostOptionsSchema.parse(await response.json());
        if (!controller.signal.aborted) setState({ source, host, options });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ source, host, error: modelCatalog.unreadable });
      });
    return () => {
      controller.abort();
    };
  }, [source, host, retry, projectContext]);
  const current =
    state.source === source && state.host === host ? state : { source, host };
  return {
    ...current,
    retry: () => {
      setRetry((value) => value + 1);
    },
  };
}

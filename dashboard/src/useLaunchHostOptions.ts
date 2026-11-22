import { useEffect, useState } from "react";
import type { LaunchHostOptions } from "./launchHostOptions.ts";
import type { ReadLaunchHostOptions } from "./launchHostOptionsClient.ts";
import { hostDescription, type HostIdentity } from "./hostDescription.ts";
export function useLaunchHostOptions(
  readOptions: ReadLaunchHostOptions,
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
    void readOptions({
      source,
      host,
      projectContext,
      signal: controller.signal,
    })
      .then((options) => {
        if (!controller.signal.aborted) setState({ source, host, options });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ source, host, error: modelCatalog.unreadable });
      });
    return () => {
      controller.abort();
    };
  }, [readOptions, source, host, retry, projectContext]);
  const current =
    state.source === source && state.host === host ? state : { source, host };
  return {
    ...current,
    retry: () => {
      setRetry((value) => value + 1);
    },
  };
}

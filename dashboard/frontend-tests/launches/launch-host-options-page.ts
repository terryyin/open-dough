import { createElement } from "react";
import { vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { unattachedPolicyOf } from "../../src/agentLaunch.ts";
import { hostName } from "../../src/sessionCapabilities.ts";
import type { HostIdentity } from "../../src/hostDescription.ts";
import { LaunchDialog } from "../../src/LaunchDialog.tsx";
import type { LaunchDialogProps } from "../../src/LaunchDialogProps.ts";
import type { ReadLaunchHostOptions } from "../../src/launchHostOptionsClient.ts";
import { unattachedSession } from "../../src/UnattachedSessionPolicy.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";

export function hold<Result>() {
  let resolve: (result: Result) => void = () => undefined;
  let reject: (reason: Error) => void = () => undefined;
  const answer = new Promise<Result>((pass, fail) => {
    resolve = pass;
    reject = fail;
  });
  return { answer, resolve, reject };
}

export function codexCatalog(configuredModel?: string) {
  return makeMe.aLaunchHostOptions
    .with({
      ...(configuredModel === undefined ? {} : { configuredModel }),
      models: [
        {
          model: "native-sol",
          name: "Native Sol",
          description: "Host supplied Sol description",
          efforts: [
            { effort: "low", description: "Quick" },
            { effort: "ultra", description: "Deep" },
          ],
        },
        {
          model: "native-luna",
          name: "Native Luna",
          description: "Host supplied Luna description",
          efforts: [{ effort: "low", description: "Quick" }],
        },
      ],
    })
    .please();
}

export async function mountCatalogDialog({
  readOptions,
  initialHost = "claude",
  viewport = { width: 1000, height: 720 },
}: {
  readOptions: ReadLaunchHostOptions;
  initialHost?: HostIdentity;
  viewport?: { width: number; height: number };
}) {
  const project = makeMe.aPublishedSource.openDough.please();
  const start = vi.fn<LaunchDialogProps["onStart"]>().mockResolvedValue(true);
  const close = vi.fn<LaunchDialogProps["onClose"]>();
  let opening = 0;
  const view = (source: typeof project, host: HostIdentity) =>
    createElement(LaunchDialog, {
      key: opening,
      sourceId: source.id,
      projectContext: true,
      readOptions,
      host,
      onHost: (next) => {
        show(source, next);
      },
      heading: `Start a session in ${source.label} in ${hostName(host)}`,
      description: "Start a background session.",
      fieldLabel: "Instruction (optional)",
      session: unattachedSession({
        policy: unattachedPolicyOf({}),
        onPolicy: vi.fn(),
        offer: "offered",
      }),
      onStart: start,
      onClose: close,
    });
  const { rerender } = await mountComponent(view(project, initialHost), {
    viewport,
  });
  function show(source: typeof project, host: HostIdentity): void {
    rerender(view(source, host));
  }
  return {
    form: launchDialog(),
    start,
    close,
    show,
    reopen: (host: HostIdentity) => {
      opening += 1;
      show(project, host);
    },
  };
}

export function optionLabels(select: ReturnType<typeof launchDialog>["model"]) {
  return [...select.element().querySelectorAll("option")].map(
    (option) => option.textContent,
  );
}

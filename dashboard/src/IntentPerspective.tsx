// The Intent perspective of the selected project: Purpose reads configured
// Gherkin source at the observed revision through the authenticated read
// boundary, and Proof truthfully says none is available yet. Unusable
// locations and failed reads each keep their own explanation; remaining
// locations stay browseable.

import { useEffect, useState } from "react";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  readIntentLocationsAt,
  type IntentLocations,
  type IntentSettingsProblem,
} from "./authenticatedIntentRead.ts";
import { IntentBrowser } from "./IntentBrowser.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import "./intent-perspective.css";

function NotConfigured({ label }: { readonly label: string }) {
  return (
    <p className="intent-not-configured">
      No intent locations are configured for {label}. Add an{" "}
      <code>intent.locations</code> setting to <code>{agentSettingsPath}</code>{" "}
      to publish Gherkin folders for Intent to read.
    </p>
  );
}

function SettingsProblem({
  label,
  problem,
  onRetry,
}: {
  readonly label: string;
  readonly problem: IntentSettingsProblem;
  readonly onRetry: () => void;
}) {
  const explanation =
    problem === "malformed"
      ? `${agentSettingsPath} is not valid JSON, so Intent locations for ${label} could not be read.`
      : `${agentSettingsPath} could not be read, so Intent locations for ${label} are unavailable.`;
  return (
    <p className="intent-settings-problem" role="alert">
      {explanation}{" "}
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </p>
  );
}

function IntentBody({
  source,
  work,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
}) {
  const [intent, setIntent] = useState<IntentLocations | "loading" | "failed">(
    work === undefined ? { status: "not-configured" } : "loading",
  );
  const [locationsRetry, setLocationsRetry] = useState(0);

  useEffect(() => {
    if (work === undefined) {
      setIntent({ status: "not-configured" });
      return;
    }
    const controller = new AbortController();
    setIntent("loading");
    void readIntentLocationsAt(source, work.revision, controller.signal)
      .then((locations) => {
        if (!controller.signal.aborted) setIntent(locations);
      })
      .catch(() => {
        if (!controller.signal.aborted) setIntent("failed");
      });
    return () => {
      controller.abort();
    };
  }, [source, work, locationsRetry]);

  if (work === undefined || intent === "loading") {
    return work === undefined ? (
      <NotConfigured label={source.label} />
    ) : (
      <p className="quiet">Reading Intent locations…</p>
    );
  }
  if (intent === "failed") {
    return (
      <p className="intent-settings-problem" role="alert">
        Intent locations for {source.label} could not be read at this revision.{" "}
        <button
          type="button"
          onClick={() => {
            setLocationsRetry((n) => n + 1);
          }}
        >
          Retry
        </button>
      </p>
    );
  }
  if (intent.status === "not-configured") {
    return <NotConfigured label={source.label} />;
  }
  if (intent.status === "settings-problem") {
    return (
      <SettingsProblem
        label={source.label}
        problem={intent.problem}
        onRetry={() => {
          setLocationsRetry((n) => n + 1);
        }}
      />
    );
  }
  return (
    <IntentBrowser
      key={`${source.id}:${work.revision}`}
      source={source}
      revision={work.revision}
      locations={intent.locations}
    />
  );
}

export function IntentPerspective({
  source,
  work,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
}) {
  return (
    <main className="intent-perspective" aria-labelledby="intent-heading">
      <h2 id="intent-heading" tabIndex={-1}>
        Intent
      </h2>
      <IntentBody source={source} work={work} />
    </main>
  );
}

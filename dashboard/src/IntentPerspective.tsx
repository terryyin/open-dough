// The Intent perspective of the selected project: Purpose reads configured
// Gherkin source at the observed revision through the authenticated read
// boundary, and Proof truthfully says none is available yet.

import { useEffect, useId, useState } from "react";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  readIntentLocationsAt,
  type IntentLocation,
  type IntentLocations,
} from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { IntentLocationTree } from "./IntentLocationTree.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
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

function IntentBrowser({
  source,
  revision,
  locations,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
}) {
  const [selectedPath, setSelectedPath] = useState("");
  const [text, setText] = useState<string | undefined>(undefined);
  const [readingFile, setReadingFile] = useState(false);
  const proofId = useId();

  // Clearing selection when the project or locations change is owned by the
  // parent remounting this browser on source/revision identity.
  useEffect(() => {
    if (selectedPath === "") {
      setText(undefined);
      return;
    }
    const controller = new AbortController();
    setReadingFile(true);
    setText(undefined);
    void readRepositoryFileAt(source, selectedPath, revision, controller.signal)
      .then((body) => {
        if (!controller.signal.aborted) {
          setText(body);
          setReadingFile(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setText(undefined);
          setReadingFile(false);
        }
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, selectedPath]);

  return (
    <div className="intent-browser">
      <div className="intent-locations">
        <h3 className="visually-hidden">Purpose locations</h3>
        {locations.map((location) => (
          <IntentLocationTree
            key={location.path}
            location={location}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
            idPrefix={`intent-${location.path.replaceAll("/", "-")}`}
          />
        ))}
      </div>
      <div className="intent-reading">
        <section className="intent-purpose" aria-label="Purpose">
          <h3>Purpose</h3>
          {selectedPath === "" ? (
            <p className="quiet">Select a feature file to read its Purpose.</p>
          ) : readingFile || text === undefined ? (
            <p className="quiet">Reading {selectedPath}…</p>
          ) : (
            <IntentSourceLines
              text={text}
              revision={revision}
              path={selectedPath}
            />
          )}
        </section>
        <section className="intent-proof" aria-labelledby={proofId}>
          <h3 id={proofId}>Proof</h3>
          {selectedPath === "" ? (
            <p className="quiet">Select a feature file to see its Proof.</p>
          ) : (
            <p>
              No Proof is available for this file yet. Intent does not collect
              or show test run observations here.
            </p>
          )}
        </section>
      </div>
    </div>
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
  }, [source, work]);

  if (work === undefined || intent === "loading") {
    return work === undefined ? (
      <NotConfigured label={source.label} />
    ) : (
      <p className="quiet">Reading Intent locations…</p>
    );
  }
  if (intent === "failed") {
    return (
      <p className="intent-not-configured">
        Intent locations for {source.label} could not be read at this revision.
      </p>
    );
  }
  if (intent.status === "not-configured") {
    return <NotConfigured label={source.label} />;
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

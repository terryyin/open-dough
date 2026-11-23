import { useState } from "react";
import { postJson, refusal } from "./agentLaunchClient.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import {
  storyAssociationChoiceEndpoint,
  storyAssociationChoiceReceiptSchema,
  type StoryAssociationCandidates,
  type StoryAssociationChoice,
} from "./storyAssociationChoice.ts";

export function ChooseSessionStory({
  record,
  candidates,
  readSession,
}: {
  readonly record: LaunchRecord;
  readonly candidates: StoryAssociationCandidates;
  readonly readSession: (record: LaunchRecord) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string>();
  const choose = async (selected: StoryAssociationChoice["selected"]) => {
    setProblem(undefined);
    setSaving(true);
    try {
      const { close, retained, published } = candidates;
      const response = await postJson(storyAssociationChoiceEndpoint, {
        source: record.request.source,
        host: record.session.host,
        session: record.session.sessionId,
        choice: { close, retained, published, selected },
      });
      if (!response.ok) {
        const refused = refusal.safeParse(await response.json());
        if (refused.success) {
          setProblem(refused.data.error);
          return;
        }
        throw new Error("Unrecognized story choice response");
      }
      storyAssociationChoiceReceiptSchema.parse(await response.json());
      await readSession(record);
    } catch {
      setProblem("The story choice could not be confirmed. Try again.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <fieldset disabled={saving} className="story-card-action-group">
      <legend>Choose a story for this session</legend>
      <button type="button" onClick={() => void choose("retained")}>
        This machine: {candidates.retained}
      </button>
      <button type="button" onClick={() => void choose("published")}>
        Published: {candidates.published}
      </button>
      {problem !== undefined && <p role="status">{problem}</p>}
    </fieldset>
  );
}

import { useEffect, useId, useRef, useState } from "react";
import { launchInstructionLimit } from "./agentLaunch.ts";

function combineTranscript(draft: string, transcript: string) {
  return draft ? `${draft}\n\n${transcript}` : transcript;
}

export function fitTranscript(draft: string, transcript: string) {
  const combined = combineTranscript(draft, transcript);
  return combined.length <= launchInstructionLimit ? combined : undefined;
}

export function TranscriptReview({
  transcript,
  draft,
  subject,
  onAdd,
  onDiscard,
}: {
  readonly transcript: string;
  readonly draft: string;
  readonly subject: string;
  readonly onAdd: (transcript: string) => void;
  readonly onDiscard: () => void;
}) {
  const [edited, setEdited] = useState(transcript);
  const candidate = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  useEffect(() => {
    candidate.current?.focus();
  }, []);
  const combinedLength = combineTranscript(draft, edited).length;
  const canAdd =
    Boolean(edited.trim()) && fitTranscript(draft, edited) !== undefined;
  return (
    <div>
      <p role="alert" id={`${id}-overflow-hint`}>
        {`This transcript exceeds the ${subject} limit. Your ${subject} was kept. Shorten the complete transcript, then add it or discard it.`}
      </p>
      <label htmlFor={`${id}-transcript`}>Transcript to shorten</label>
      <textarea
        ref={candidate}
        className="frame-input"
        id={`${id}-transcript`}
        aria-describedby={`${id}-overflow-hint ${id}-overflow-length`}
        rows={4}
        value={edited}
        onChange={(event) => {
          setEdited(event.target.value);
        }}
      />
      <p id={`${id}-overflow-length`} aria-live="polite">
        {edited.trim()
          ? `${combinedLength.toLocaleString()} of ${launchInstructionLimit.toLocaleString()} combined characters, including the separator.`
          : "Enter transcript text to add, or discard this transcript."}
      </p>
      <button
        type="button"
        className="frame-button"
        disabled={!canAdd}
        onClick={() => {
          if (canAdd) {
            onAdd(edited);
          }
        }}
      >
        Add transcript
      </button>{" "}
      <button type="button" className="frame-button" onClick={onDiscard}>
        Discard transcript
      </button>
    </div>
  );
}

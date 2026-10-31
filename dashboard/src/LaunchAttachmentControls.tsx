// Shared Attach images control for every launch dialog: picker, numbered list
// with preview and Remove. Bytes stay in the browser until Start uploads them.
// Unsuitable picks are named with a reason; accepted images and the rest of
// the draft stay.

import { useEffect, useId, useRef, useState } from "react";
import {
  partitionLaunchAttachments,
  type LaunchAttachmentRefusal,
} from "./launchAttachments.ts";
import "./launch-attachments.css";

export type DraftAttachment = {
  readonly id: string;
  readonly file: File;
  readonly preview: string;
};

export function useLaunchAttachments() {
  const [items, setItems] = useState<readonly DraftAttachment[]>([]);
  const [refusals, setRefusals] = useState<readonly LaunchAttachmentRefusal[]>(
    [],
  );
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(
    () => () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.preview);
    },
    [],
  );

  const addFiles = (files: readonly File[]) => {
    const current = itemsRef.current;
    const { accepted, refusals: nextRefusals } = partitionLaunchAttachments(
      files,
      current.length,
    );
    setRefusals(nextRefusals);
    if (accepted.length === 0) return;
    setItems([
      ...current,
      ...accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeAt = (index: number) => {
    setItems((current) => {
      const target = current[index];
      if (target !== undefined) URL.revokeObjectURL(target.preview);
      return [...current.slice(0, index), ...current.slice(index + 1)];
    });
  };

  return {
    items,
    files: items.map((item) => item.file),
    refusals,
    addFiles,
    removeAt,
  };
}

export function LaunchAttachments({
  id,
  items,
  refusals = [],
  onAdd,
  onRemove,
  disabled = false,
}: {
  readonly id: string;
  readonly items: readonly DraftAttachment[];
  readonly refusals?: readonly LaunchAttachmentRefusal[];
  readonly onAdd: (files: readonly File[]) => void;
  readonly onRemove: (index: number) => void;
  readonly disabled?: boolean;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="launch-attachments">
      <input
        ref={input}
        id={inputId}
        type="file"
        multiple
        hidden
        tabIndex={-1}
        disabled={disabled}
        onChange={(event) => {
          const target = event.currentTarget;
          const list = target.files;
          if (list !== null && list.length > 0) onAdd([...list]);
          target.value = "";
        }}
      />
      <button
        type="button"
        className="frame-button"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        Attach images
      </button>
      {items.length > 0 && (
        <ul className="launch-attachment-list" aria-label="Attached images">
          {items.map((item, index) => (
            <li key={item.id} className="launch-attachment-item">
              <img
                src={item.preview}
                alt=""
                className="launch-attachment-preview"
              />
              <span id={`${id}-attachment-${String(index + 1)}`}>
                {`Image ${String(index + 1)} · ${item.file.name}`}
              </span>
              <button
                type="button"
                className="frame-button"
                disabled={disabled}
                aria-label={`Remove Image ${String(index + 1)}`}
                onClick={() => {
                  onRemove(index);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {refusals.length > 0 && (
        <ul
          className="launch-attachment-refusals"
          aria-label="Refused images"
          role="alert"
        >
          {refusals.map((refusal, index) => (
            <li key={`${refusal.name}-${refusal.reason}-${String(index)}`}>
              {`${refusal.name} · ${refusal.reason}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

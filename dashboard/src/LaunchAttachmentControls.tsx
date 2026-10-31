// Shared Attach images control for every launch dialog: picker, numbered list
// with preview and Remove. Bytes stay in the browser until Start uploads them.

import { useEffect, useId, useRef, useState } from "react";
import {
  launchAttachmentAccept,
  launchAttachmentMaxCount,
} from "./launchAttachments.ts";
import "./launch-attachments.css";

export type DraftAttachment = {
  readonly id: string;
  readonly file: File;
  readonly preview: string;
};

export function useLaunchAttachments() {
  const [items, setItems] = useState<readonly DraftAttachment[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(
    () => () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.preview);
    },
    [],
  );

  const addFiles = (files: readonly File[]) => {
    setItems((current) => {
      const room = launchAttachmentMaxCount - current.length;
      if (room <= 0) return current;
      const next = [
        ...current,
        ...files.slice(0, room).map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        })),
      ];
      return next;
    });
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
    addFiles,
    removeAt,
  };
}

export function LaunchAttachments({
  id,
  items,
  onAdd,
  onRemove,
  disabled = false,
}: {
  readonly id: string;
  readonly items: readonly DraftAttachment[];
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
        className="launch-attachments-input"
        accept={launchAttachmentAccept}
        multiple
        disabled={disabled || items.length >= launchAttachmentMaxCount}
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
        disabled={disabled || items.length >= launchAttachmentMaxCount}
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
    </div>
  );
}

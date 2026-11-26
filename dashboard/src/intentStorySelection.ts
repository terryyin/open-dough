import { storyFilePath, type StoryOverlay } from "./intentStoryOverlay.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";

export function storyFileSelection(
  overlay: StoryOverlay,
  selection: IntentSelection,
): IntentSelection {
  if (selectionScope(selection) !== "file") return selection;
  const path = storyFilePath(overlay, selection.path);
  return path === selection.path ? selection : { ...selection, path };
}

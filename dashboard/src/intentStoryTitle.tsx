import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  sameSelectedStory,
  type SelectedStory,
} from "./pageStorySelection.tsx";

type StoryTitle = SelectedStory & { readonly title: string };
const IntentStoryTitle = createContext<StoryTitle | undefined>(undefined);
const PublishIntentStoryTitle = createContext<
  Dispatch<SetStateAction<StoryTitle | undefined>> | undefined
>(undefined);

// The banner and the Intent reader are siblings. Share the title the reader
// has already resolved, scoped to the project and story that supplied it.
export function IntentStoryTitleProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [title, publish] = useState<StoryTitle>();
  return (
    <PublishIntentStoryTitle value={publish}>
      <IntentStoryTitle value={title}>{children}</IntentStoryTitle>
    </PublishIntentStoryTitle>
  );
}

export function usePublishIntentStoryTitle(
  project: string,
  story: Pick<StoryTitle, "identity" | "title"> | undefined,
) {
  const publish = useContext(PublishIntentStoryTitle);
  const { identity, title } = story ?? {};
  useLayoutEffect(() => {
    if (publish === undefined || identity === undefined || title === undefined)
      return;
    const announced = { project, identity, title };
    publish(announced);
    return () => {
      publish((current) => (current === announced ? undefined : current));
    };
  }, [publish, project, identity, title]);
}

export function useIntentStoryTitle(selected: SelectedStory | undefined) {
  const title = useContext(IntentStoryTitle);
  return title !== undefined && sameSelectedStory(selected, title)
    ? title.title
    : selected?.identity;
}

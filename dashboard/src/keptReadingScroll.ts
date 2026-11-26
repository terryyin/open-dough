// The reading pane's scroll offset, kept in the project's reading place
// (`./pageIntentReading.tsx`) for each scope.
import { useLayoutEffect, type RefObject } from "react";
import { useScopedPlace } from "./pageIntentReading.tsx";

// Keeps the reading pane's scroll offset while content still arrives or
// lengthens (for example Proof figures settling under the chosen tab).
// Restoring stops only when the developer scrolls, presses a key or uses a
// pointer in the pane; ending on the first successful match let later growth
// move the place through scroll anchoring.
export function useKeptReadingScroll(pane: RefObject<HTMLElement | null>) {
  const { place, key: scope } = useScopedPlace("scrollTop");
  useLayoutEffect(() => {
    const element = pane.current;
    if (element === null) return;
    let restoring = place.scrollTops.get(scope) ?? 0;
    const restore = () => {
      if (restoring === 0) return;
      element.scrollTop = restoring;
    };
    const grown = new ResizeObserver(restore);
    function stop() {
      restoring = 0;
      grown.disconnect();
    }
    const record = () => {
      if (restoring === 0) place.scrollTops.set(scope, element.scrollTop);
    };
    const interactions = ["wheel", "touchstart", "keydown", "pointerdown"];
    for (const each of interactions) element.addEventListener(each, stop);
    element.addEventListener("scroll", record);
    for (const child of element.children) grown.observe(child);
    restore();
    return () => {
      grown.disconnect();
      for (const each of interactions) element.removeEventListener(each, stop);
      element.removeEventListener("scroll", record);
    };
  }, [pane, place, scope]);
}

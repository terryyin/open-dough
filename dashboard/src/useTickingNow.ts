// The page's clock: now, advancing every `tickMs` of page time.

import { useEffect, useState } from "react";

export function useTickingNow(tickMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const ticking = setInterval(() => {
      setNow(Date.now());
    }, tickMs);
    return () => {
      clearInterval(ticking);
    };
  }, [tickMs]);
  return now;
}

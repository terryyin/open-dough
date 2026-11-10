// Only the external HTTP boundary is substituted. Request subjects and their
// AbortSignals come from the production authenticated readers.
export function heldResponse() {
  let release: (response: Response) => void = () => undefined;
  const response = new Promise<Response>((resolve) => {
    release = resolve;
  });
  return { response, release };
}

export function ciReadingTransport(
  answer: (
    query: URLSearchParams,
    index: number,
  ) => Promise<Response> | Response,
) {
  const requests: { readonly url: string; readonly signal: AbortSignal }[] = [];
  const saved = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    if (init?.signal === undefined || init.signal === null)
      throw new Error("The authenticated reader must supply its AbortSignal");
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    requests.push({ url, signal: init.signal });
    return Promise.resolve(
      answer(new URL(url, "http://local.test").searchParams, requests.length),
    );
  };
  return {
    requests,
    restore() {
      globalThis.fetch = saved;
    },
  };
}

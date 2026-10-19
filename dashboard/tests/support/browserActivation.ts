// Actual callback source executes against these external API stand-ins only.
// Unknown window setters fail, matching the separate Safari/Chrome dictionaries.
import vm from "node:vm";

export type BrowserBundle = "com.apple.Safari" | "com.google.Chrome";
type Tab = { id: number; url: string };
type Window = {
  id: number;
  tabs: Tab[];
  selected: number;
  minimized: boolean;
};
type NativeTab = { url: unknown; id: () => number; index: () => number };

export function browserActivation(
  source: string,
  bundle: BrowserBundle,
  locations: readonly (readonly string[])[],
  options: {
    running?: boolean;
    readErrorAt?: string;
    windowsError?: boolean;
    writeError?: boolean;
    defaultBrowser?: string;
    windowDelay?: number;
    targetDelay?: number;
  } = {},
) {
  let nextId = 1;
  let running = options.running ?? true;
  let frontmost = false;
  const alerts: string[] = [];
  const opened: string[] = [];
  let ticks = 0;
  let pending: string | undefined;
  const windows: Window[] = locations.map((urls) => ({
    id: nextId++,
    tabs: urls.map((url) => ({ id: nextId++, url })),
    selected: 1,
    minimized: true,
  }));
  const tabStates = new Map<NativeTab, Tab>();
  const tabs = new Map<Tab, NativeTab>();
  function nativeTab(tab: Tab): NativeTab {
    const existing = tabs.get(tab);
    if (existing !== undefined) return existing;
    const value = {
      id: () => tab.id,
      index: () =>
        (windows
          .find((window) => window.tabs.includes(tab))
          ?.tabs.indexOf(tab) ?? -1) + 1,
      get url() {
        return () => {
          if (options.readErrorAt === tab.url)
            throw Object.assign(new Error("Inspection denied"), {
              errorNumber: -1743,
            });
          return tab.url;
        };
      },
      set url(next: unknown) {
        if (options.writeError === true) throw new Error("Navigation denied");
        if (typeof next !== "string") throw new Error("URL must be data");
        Object.assign(tab, { url: next });
      },
    };
    tabs.set(tab, value);
    tabStates.set(value, tab);
    return value;
  }
  function nativeWindow(window: Window) {
    const tabList = Object.assign(() => window.tabs.map(nativeTab), {
      push: (value: NativeTab) => {
        const tab = tabStates.get(value);
        if (tab === undefined) throw new Error("Unknown tab");
        window.tabs.push(tab);
      },
    });
    const value = {
      tabs: tabList,
      id: () => window.id,
      get index() {
        return () => windows.indexOf(window) + 1;
      },
      set index(position: unknown) {
        if (position !== 1) throw new Error("Unsupported window position");
        windows.splice(windows.indexOf(window), 1);
        windows.unshift(window);
      },
    };
    Object.defineProperty(
      value,
      bundle === "com.apple.Safari" ? "miniaturized" : "minimized",
      {
        get: () => () => window.minimized,
        set: (next: unknown) => {
          Object.assign(window, { minimized: next === true });
        },
      },
    );
    if (bundle === "com.apple.Safari")
      Object.defineProperty(value, "currentTab", {
        get: () => () => {
          const tab = window.tabs[window.selected - 1];
          if (tab === undefined) throw new Error("No selected tab");
          return nativeTab(tab);
        },
        set: (next: NativeTab) => {
          const tab = tabStates.get(next);
          if (tab === undefined) throw new Error("Unknown selected tab");
          Object.assign(window, { selected: window.tabs.indexOf(tab) + 1 });
        },
      });
    else
      Object.defineProperty(value, "activeTabIndex", {
        get: () => () => window.selected,
        set: (next: unknown) => {
          if (typeof next !== "number") throw new Error("Invalid tab index");
          Object.assign(window, { selected: next });
        },
      });
    return new Proxy(Object.preventExtensions(value), {
      set(target, property, next: unknown) {
        if (!(property in target))
          throw new Error(`Unknown browser property ${String(property)}`);
        return Reflect.set(target, property, next);
      },
    });
  }
  const browser = {
    running: () => running,
    windows: () => {
      if (options.windowsError === true)
        throw new Error("Window inspection denied");
      return windows.map(nativeWindow);
    },
    Tab: ({ url }: { url: string }) => nativeTab({ id: nextId++, url }),
    activate: () => {
      frontmost = true;
    },
  };
  const Application = Object.assign(
    (requested: string) => {
      if (requested !== bundle) throw new Error("Unexpected browser");
      return browser;
    },
    {
      currentApplication: () => ({
        displayAlert: (title: string) => {
          alerts.push(title);
        },
      }),
    },
  );
  function advanceOpening() {
    if (pending === undefined) return;
    if (windows.length === 0 && ticks >= (options.windowDelay ?? 0))
      windows.unshift({
        id: nextId++,
        tabs: [{ id: nextId++, url: "about:blank" }],
        selected: 1,
        minimized: false,
      });
    const tab = windows[0]?.tabs[0];
    if (tab !== undefined && ticks >= (options.targetDelay ?? 0)) {
      tab.url = pending;
      pending = undefined;
    }
  }
  const workspace = {
    URLForApplicationToOpenURL: () => "native-application-url",
    openURL: (target: { absoluteString: string }) => {
      opened.push(target.absoluteString);
      running = true;
      pending = target.absoluteString;
      advanceOpening();
      return true;
    },
  };
  const context = vm.createContext({
    Application,
    ObjC: { import: () => {}, unwrap: (value: unknown) => value },
    $: {
      NSURL: {
        URLWithString: (value: string) => {
          const url = new URL(value);
          return {
            absoluteString: url.href,
            scheme: url.protocol.slice(0, -1),
            host: url.hostname,
            port: url.port === "" ? null : Number(url.port),
            path: url.pathname,
          };
        },
      },
      NSBundle: {
        bundleWithURL: () => ({
          bundleIdentifier: options.defaultBrowser ?? bundle,
        }),
      },
      NSWorkspace: { sharedWorkspace: workspace },
    },
    delay: () => {
      ticks++;
      advanceOpening();
    },
  });
  vm.runInContext(source, context);
  const run = context["run"] as (args: string[]) => void;
  return {
    click: (destination: string) => {
      run([destination]);
    },
    windows,
    alerts,
    opened,
    frontmost: () => frontmost,
    ticks: () => ticks,
  };
}

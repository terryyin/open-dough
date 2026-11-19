import path from "node:path";
import { fileURLToPath } from "node:url";
import { browserGroupSelection, frontendGroup } from "./browserTestGroups.mjs";
import { selectedFiles } from "./testFiles.mjs";

const mountedSuffix = /\.mounted(?=\.(?:spec|test)\.[cm]?[jt]sx?$)/;

export function isMountedSpec(file) {
  return mountedSuffix.test(file);
}

export function frontendFiles(split) {
  const { directory } = frontendGroup;
  return selectedFiles(
    directory,
    split,
    browserGroupSelection(frontendGroup),
  ).map((file) => ({
    file: path.resolve(fileURLToPath(directory), file),
    label: file,
    logicalLabel: file.replace(mountedSuffix, ""),
    mounted: isMountedSpec(file),
  }));
}

// File and title filters use the same patterns as Playwright, including
// /pattern/flags. Stateful flags are immaterial for independent matches.
function filterPattern(source) {
  const literal = /^\/(.*)\/([gi]*)$/.exec(source);
  return literal
    ? new RegExp(literal[1], literal[2].replace("g", ""))
    : new RegExp(source, "i");
}

export function frontendArguments(argv) {
  const files = [];
  let grep, grepInvert, workers, reporter, project;
  let list = false;
  let allowEmpty = false;
  let positional = false;
  const nativeOptions = [];
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (positional || !arg.startsWith("-")) {
      const location = /^(.*?):(\d+)(?::(\d+))?$/.exec(arg);
      files.push({
        pattern: filterPattern(location?.[1] ?? arg),
        line: location ? Number(location[2]) : undefined,
        column: location?.[3] === undefined ? undefined : Number(location[3]),
      });
      continue;
    }
    if (arg === "--") {
      positional = true;
      continue;
    }
    if (arg === "--list") {
      list = true;
      continue;
    }
    if (arg === "--pass-with-no-tests") {
      allowEmpty = true;
      continue;
    }
    const equals = arg.indexOf("=");
    const key = equals < 0 ? arg : arg.slice(0, equals);
    if (
      ![
        "-g",
        "--grep",
        "-G",
        "--grep-invert",
        "-j",
        "--workers",
        "--reporter",
        "--project",
      ].includes(key)
    ) {
      nativeOptions.push(key);
      continue;
    }
    const value = equals < 0 ? argv[++index] : arg.slice(equals + 1);
    if (!value) throw new Error(`${key} needs a value.`);
    if (key === "-g" || key === "--grep") grep = filterPattern(value);
    else if (key === "-G" || key === "--grep-invert")
      grepInvert = filterPattern(value);
    else if (key === "-j" || key === "--workers") workers = value;
    else if (key === "--reporter") reporter = value;
    else project = value;
  }
  return {
    files,
    grep,
    grepInvert,
    workers,
    reporter,
    project,
    list,
    allowEmpty,
    nativeOptions,
  };
}

function fileMatches(entry, { pattern }) {
  return (
    pattern.test(entry.file) ||
    (entry.mounted && pattern.test(entry.file.replace(mountedSuffix, "")))
  );
}

export function matchesFrontendFile(entry, args) {
  return (
    args.files.length === 0 ||
    args.files.some((filter) => fileMatches(entry, filter))
  );
}

export function matchesMountedCase(entry, args, title, location) {
  const grepTitle = `chromium ${entry.logicalLabel} ${title}`;
  return (
    (args.grep?.test(grepTitle) ?? true) &&
    !(args.grepInvert?.test(grepTitle) ?? false) &&
    (args.files.length === 0 ||
      args.files.some(
        (filter) =>
          fileMatches(entry, filter) &&
          (filter.line === undefined || filter.line === location?.line) &&
          (filter.column === undefined || filter.column === location?.column),
      ))
  );
}

const Module = require("node:module");

const originalLoad = Module._load;
Module._load = function loadWithoutFsevents(...args) {
  if (args[0] === "fsevents") {
    throw Object.assign(new Error("Cannot find module 'fsevents'"), {
      code: "MODULE_NOT_FOUND",
    });
  }
  return originalLoad.apply(this, args);
};

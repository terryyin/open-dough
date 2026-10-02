import type { Plugin } from "vite";
import { projectListEndpoint } from "../src/projectConfiguration.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { publishedProjects } from "./projectConfiguration.ts";

export function projectConfigurationPlugin(): Plugin {
  return localBoundaryPlugin("dough-project-configuration", (middlewares) => {
    middlewares.use((req, res, next) => {
      const url = new URL(req.url ?? "", "http://placeholder");
      if (url.pathname !== projectListEndpoint) {
        next();
        return;
      }
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      try {
        verifyLocalOrigin(req);
        if (req.method !== "GET")
          throw new RefusedRequest(405, "Only GET is accepted.");
        res.end(JSON.stringify(publishedProjects()));
      } catch (error) {
        if (!(error instanceof RefusedRequest)) {
          next(error);
          return;
        }
        res.writeHead(error.status);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return () => {};
  });
}

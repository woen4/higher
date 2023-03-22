import glob from "glob";
import path from "path";
import { setupFastify } from "./adapters/routers/fastify";
import { RouteDefinition } from "./types";
import { FastifyServerOptions } from "fastify";
import fs from "fs";

export async function bootstrap(
  dirname: string,
  options?: FastifyServerOptions
) {
  const path_ = path.resolve(dirname, "**", "*.ts");
  const dirFiles = await glob(path_);

  const routes = dirFiles
    .map((filePath) => {
      // Ex: /home/pc/user/Documents/project_name/src/modules/users... -> /modules/users
      const filePathFromSrc = filePath.split("src")[1];

      // Match route and method -> /modules/user/get.ts -> /users, get
      const matched = filePathFromSrc.match(
        /modules(.*?)\/(get|post|patch|delete|put)\.ts/
      );

      if (matched) {
        const [_, route, method] = matched;

        const parsedRoute = route === "" ? "/" : route;

        return [filePath, parsedRoute, method];
      }
    })
    .filter((route) => !!route) as RouteDefinition[];

  const providersPath = path.resolve(dirname, "providers");

  if (!fs.existsSync(providersPath))
    throw new Error(
      "You need a provider folder with a index.ts file inside, in 'src' directory"
    );

  const context = await import(providersPath);

  /* Load routes */
  return setupFastify(routes, context, options);
}

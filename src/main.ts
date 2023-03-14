import glob from "glob";
import path from "path";
import { setupFastify } from "./adapters/routers/fastify";
import { RouteDefinition } from "./types";
import { FastifyListenOptions } from "fastify";

export async function bootstrap(
  dirname: string,
  options?: FastifyListenOptions
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
        return [filePath, route, method];
      }
    })
    .filter((route) => !!route) as RouteDefinition[];

  const context = await import(path.resolve(dirname, "providers"));

  /* Load routes */
  setupFastify(routes, context, options ?? { port: 3000 });
}

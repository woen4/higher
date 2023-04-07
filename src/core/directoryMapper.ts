import glob from "glob";
import path from "path";
import { MiddlewareSchema, RouteSchema } from "../types";
import fs from "fs";

export async function mapDirectory(dirname: string) {
  const directoryFiles = await getDirectoryFiles(dirname);

  const routes = getRoutes(directoryFiles);
  const middlewares = getMiddlewares(directoryFiles);

  const providers = getProviders(dirname);

  /* Load routes */
  return { routes, middlewares, providers };
}

function getDirectoryFiles(dirname: string) {
  const filesPaths = path.resolve(dirname, "**", "*.ts");
  return glob(filesPaths);
}

function getMiddlewares(directoryFiles: string[]): MiddlewareSchema[] {
  const middlewares: MiddlewareSchema[] = [];

  for (const filePath of directoryFiles) {
    const isMiddleware = filePath.endsWith("/middleware.ts");

    if (isMiddleware) {
      middlewares.push({
        scope: filePath.match(/src\/modules(.*?)\/middleware.ts/)![1],
        filePath,
      } as any);
    }
  }

  return middlewares;
}

function getRoutes(directoryFiles: string[]): RouteSchema[] {
  const routes: RouteSchema[] = [];

  for (const filePath of directoryFiles) {
    // Ex: /home/pc/user/Documents/project_name/src/modules/users... -> /modules/users
    const filePathFromSrc = filePath.split("src").reverse()[0];

    // Match route and method -> /modules/user/get.ts -> /users, get
    const matched = filePathFromSrc.match(
      /modules(.*?)\/(get|post|patch|delete|put)\.ts/
    );

    if (matched) {
      const [_, route, method] = matched;

      const parsedRoute = route === "" ? "/" : route;

      routes.push({ filePath, route: parsedRoute, method } as any);
    }
  }

  return routes;
}

function getProviders(dirname: string) {
  const providersPath = path.resolve(dirname, "providers");

  if (!fs.existsSync(providersPath))
    throw new Error(
      "You need a provider folder with a index.ts file inside, in 'src' directory"
    );

  return { filePath: providersPath };
}

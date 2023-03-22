import glob from "glob";
import path from "path";
import { setupFastify } from "./adapters/routers/fastify";
import { RouteSchema } from "./types";
import { FastifyServerOptions } from "fastify";
import fs from "fs";

export async function bootstrap(
  dirname: string,
  options?: FastifyServerOptions
) {
  const directoryFiles = await getDirectoryFiles(dirname);

  const routes = directoryFiles
    .map(parseFilePath)
    .filter((route) => !!route) as RouteSchema[];

  const context = await getProviders(dirname);

  /* Load routes */
  return setupFastify(routes, context, options);
}

function getDirectoryFiles(dirname: string) {
  const filesPaths = path.resolve(dirname, "**", "*.ts");
  return glob(filesPaths);
}

function parseFilePath(filePath: string): RouteSchema | undefined {
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
}

function getProviders(dirname: string) {
  const providersPath = path.resolve(dirname, "providers");

  if (!fs.existsSync(providersPath))
    throw new Error(
      "You need a provider folder with a index.ts file inside, in 'src' directory"
    );

  return import(providersPath);
}

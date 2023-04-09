import chalk from "chalk";
import { FastifyServerOptions } from "fastify";
import { schema } from "../generated/schema";
import { setupFastify } from "./adapters/routers/fastify";

export const bootstrap = (options?: FastifyServerOptions) => {
  console.log(chalk.bold.redBright("⚡️ Higher ⚡️"));

  return setupFastify({
    ...schema,
    options,
  } as any);
};

import { FastifyServerOptions } from "fastify";
import { schema } from "../generated/schema";
import { setupFastify } from "./adapters/routers/fastify";

export const bootstrap = (options?: FastifyServerOptions) =>
  setupFastify({
    ...schema,
    options,
  } as any);

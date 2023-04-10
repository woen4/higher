import { FastifyServerOptions } from "fastify";
import { schema } from "../generated/schema";
import { setupFastify } from "./adapters/routers/fastify";

export const bootstrap = (options?: FastifyServerOptions) => {
  return setupFastify({
    ...schema,
    options,
  } as any);
};

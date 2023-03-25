import { FastifyServerOptions } from "fastify";
import { setupFastify, SetupFastifyParams } from "./adapters/routers/fastify";
import { schema } from "../generated/schema";

export async function bootstrap(options?: FastifyServerOptions) {
  /* Load routes */
  return setupFastify({
    ...schema,
    options,
  } as SetupFastifyParams);
}

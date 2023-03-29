import { schema } from "../generated/schema";
import { setupFastify, SetupFastifyParams } from "./adapters/routers/fastify";

export const bootstrap = (options?: SetupFastifyParams) =>
  setupFastify({
    ...schema,
    options,
  } as any);

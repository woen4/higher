import { schema } from "../generated/schema";
import { Hono } from "hono";

type Bootstrap = <T extends "hono" | "fastify">(
  router: T,
  options: T extends "hono" ? Pick<Hono, "router" | "strict"> : any
) => Promise<any>;

export const bootstrap: Bootstrap = async (router, options) => {
  if (router === "hono") {
    const { setupHono } = await import("./adapters/routers/hono");
    return setupHono({
      ...schema,
      options,
    } as any);
  } else {
    /*  const { setupFastify } = await import("./adapters/routers/fastify");

    return setupFastify({
      ...schema,
      options,
    } as any); */
  }
};

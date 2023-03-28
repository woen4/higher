import { schema } from "../generated/schema";
import { Hono } from "hono";

type Bootstrap = <T extends "hono" | "fastify">(
  router: T,
  options?: T extends "hono"
    ? Pick<Hono, "router" | "strict">
    : import("fastify").FastifyServerOptions
) => Promise<any>;

export const bootstrap: Bootstrap = (router, options) => {
  if (router === "hono") {
    const { setupHono } = require("./adapters/routers/hono");
    return setupHono({
      ...schema,
      options,
    } as any);
  }

  /*   const { setupFastify } = await import(`./adapters/routers/${"fastify"}`);

  return setupFastify({
    ...schema,
    options,
  } as any); */
};

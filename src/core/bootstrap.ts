import { schema } from "../generated/schema";
import { Hono } from "hono";
import { setupHono } from "./adapters/routers/hono";

export const bootstrap = (options?: Pick<Hono, "router" | "strict">) => {
  return setupHono({
    ...schema,
    options,
  } as any);
};

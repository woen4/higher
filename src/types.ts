import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { HigherResponse } from "./core/utils";

export type RouteSchema = {
  filePath: string;
  route: string;
  method: "get" | "post" | "patch" | "delete" | "patch" | "options";
  getModule: () => Resource;
};

export type MiddlewareResource = {
  handle: (
    context: unknown,
    request: FastifyRequest,
    reply: FastifyReply
  ) => unknown;
  excludePaths: string[];
};

export type MiddlewareSchema = {
  filePath: string;
  scope: string;
  getModule: () => MiddlewareResource;
};

export type Resource = {
  handle: (
    context: unknown,
    request: HigherRequest,
    reply?: unknown
  ) => Promise<string | HigherResponse | object>;
  schema?: z.AnyZodObject;
  querySchema?: z.AnyZodObject;
  requirements?: ((req: HigherRequest) => Promise<HigherResponse | void>)[];
};

export type HigherReply = FastifyReply;

export type HigherRequest<
  Super extends {} | void = void,
  Body extends z.ZodType | void = void,
  Query extends z.ZodType | void = void
> = {
  body: Body extends z.ZodType ? z.infer<Body> : unknown;
  rawBody: unknown;
  params: Record<string, string>;
  query: Query extends z.ZodType ? z.infer<Query> : unknown;
  rawQuery: Record<string, string>;
} & FastifyRequest &
  Super;

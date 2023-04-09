import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export type RouteSchema = {
  filePath: string;
  route: string;
  method: "get" | "post" | "patch" | "delete" | "patch" | "options";
  getModule: () => any;
};

export type MiddlewareResource = {
  handle: (context: unknown, request: FastifyRequest) => unknown;
  excludePaths: string[];
};

export type MiddlewareSchema = {
  filePath: string;
  scope: string;
  getModule: () => MiddlewareResource;
};

export type Resource = {
  handle: (context: unknown, request: unknown, reply?: unknown) => unknown;
  schema?: z.AnyZodObject;
  querySchema?: z.AnyZodObject;
};

export type HigherResponse = FastifyReply;

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

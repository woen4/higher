import { z } from "zod";

export type RouteSchema = [filePath: string, route: string, method: string];

export type Resource = {
  handle: (context: unknown, request: unknown, reply: unknown) => unknown;
  schema?: z.AnyZodObject;
};

export type HigherRequest<T = unknown> = {
  fastifyRequest: import("fastify").FastifyRequest;
  payload: import("zod").z.infer<T>;
};

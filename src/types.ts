import { z } from "zod";

export type RouteSchema = {
  filePath: string;
  route: string;
  method: "get" | "post" | "patch" | "delete" | "patch" | "options";
  getModule: () => any;
};

export type MiddlewareSchema = {
  filePath: string;
  scope: string;
  getModule: () => any;
};

export type Resource = {
  handle: (context: unknown, request: unknown, reply?: unknown) => unknown;
  schema?: z.AnyZodObject;
};

export type HigherRequest<T extends z.ZodType<any, any, any>> = {
  body: import("zod").z.infer<T>;
  rawBody: unknown;
};

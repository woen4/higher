import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import {
  MiddlewareSchema,
  MiddlewareResource,
  Resource,
  RouteSchema,
} from "../../../types";
import { z } from "zod";
import chalk from "chalk";
import { HigherResponse } from "../../utils";
import fastifyMiddie from "@fastify/middie";
import type { Server } from "connect";

export type SetupFastifyParams = {
  routes: RouteSchema[];
  middlewares: MiddlewareSchema[];
  providers: {
    filePath: string;
    getModule: () => Promise<MiddlewareResource>;
  };
  options?: FastifyServerOptions;
};

export const setupFastify = ({
  routes,
  middlewares,
  providers,
  options,
}: SetupFastifyParams) => {
  const fastifyInstance = Fastify(options);

  const context = providers.getModule();

  registerRoutes(routes, context, fastifyInstance);

  registerMiddlewares(middlewares, context, fastifyInstance);

  return fastifyInstance;
};

function registerMiddlewares(
  middlewares: MiddlewareSchema[],
  context: unknown,
  fastifyInstance: FastifyInstance
) {
  fastifyInstance.addHook("preHandler", async (request, reply) => {
    const targetMiddleware = middlewares.find((middleware) =>
      request.url.includes(middleware.scope)
    );

    if (!targetMiddleware) return;

    const { handle, excludePaths }: MiddlewareResource =
      targetMiddleware.getModule();

    const urlWithParams = Object.keys(request.params).reduce(
      (url, paramKey) => url.replace(request.params[paramKey], `:${paramKey}`),
      request.url
    );

    const shouldSkip = excludePaths
      ? excludePaths.some((path) => urlWithParams.includes(path))
      : false;

    if (shouldSkip) return;

    const response = await handle(context, request, reply);

    if (response) {
      if (response instanceof HigherResponse) {
        reply
          .status(response.status)
          .headers(response.headers)
          .send(response.payload);
      } else {
        reply.send(response);
      }
    }
  });
}
const validate = async (schema: z.AnyZodObject, payload: unknown) => {
  if (!schema) return payload;
  const bodyParsed = schema.safeParse(payload);

  if (bodyParsed?.success === true) {
    return bodyParsed.data;
  } else {
    throw bodyParsed.error;
  }
};

function registerRoutes(
  routes: RouteSchema[],
  context: any,
  fastifyInstance: FastifyInstance
) {
  for (const { route, method, getModule } of routes) {
    const parsedRoute = route.replace(/\[(.*?)\]/g, ":$1");

    console.log(
      chalk.green(`Mapped route `) +
        chalk.yellowBright("-") +
        chalk.green(` ${method.toUpperCase()}`) +
        chalk.yellowBright(` ${parsedRoute}`)
    );

    const { handle, schema, querySchema }: Resource = getModule();

    fastifyInstance[method](parsedRoute, async (request, reply) => {
      try {
        const queryData = await validate(querySchema, request.query);
        const bodyData = await validate(schema, request.body);

        const response = await handle(
          context,
          {
            ...request,
            body: bodyData,
            rawBody: request.body,
            query: queryData,
            rawQuery: request.query,
          },
          reply
        );

        if (response instanceof HigherResponse) {
          return reply
            .status(response.status)
            .headers(response.headers)
            .send(response.payload);
        } else {
          return response;
        }
      } catch (e) {
        reply.status(500).send(e.message);
        console.error(chalk.red(e));
      }
    });
  }
}

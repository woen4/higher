import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import {
  MiddlewareSchema,
  MiddlewareResource,
  Resource,
  RouteSchema,
} from "../../../types";
import { z } from "zod";

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
  for (const { scope, getModule } of middlewares) {
    //
    fastifyInstance.addHook("preParsing", async (request) => {
      if (request.url.includes(scope)) {
        const { handle, excludePaths }: MiddlewareResource = getModule();
        [];
        const shouldSkip = excludePaths.some((path) =>
          request.url.includes(path)
        );

        if (!shouldSkip) return;

        await handle(context, request);
      }
    });
  }

  /*  fastifyInstance.register(middie, { hook: "preParsing" }).then(() => {
    for (const { scope, getModule } of middlewares) {
      const { handle } = getModule();
      (fastifyInstance as unknown as Server).use(scope, handle);
    }
  }); */
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
  import("chalk").then(({ default: chalk }) => {
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

          reply.send(response);
        } catch (e) {
          reply.status(500).send("Internal Error");
          console.error(e);
        }
      });
    }
  });
}

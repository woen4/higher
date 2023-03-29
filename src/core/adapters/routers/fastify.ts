import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import { MiddlewareSchema, Resource, RouteSchema } from "../../../types";
import type { Server } from "connect";
import middie from "@fastify/middie";

export type SetupFastifyParams = {
  routes: RouteSchema[];
  middlewares: MiddlewareSchema[];
  providers: {
    filePath: string;
    getModule: () => Promise<any>;
  };
  options?: FastifyServerOptions;
};

export const setupFastify = (params: SetupFastifyParams) => {
  const fastifyInstance = Fastify(params.options);

  registerRoutes(params, fastifyInstance);

  registerMiddlewares(params, fastifyInstance);

  return fastifyInstance;
};

function registerMiddlewares(
  { middlewares }: SetupFastifyParams,
  fastifyInstance: FastifyInstance
) {
  fastifyInstance.register(middie).then(() => {
    for (const { scope, getModule } of middlewares) {
      const { handle } = getModule();
      (fastifyInstance as unknown as Server).use(scope, handle);
    }
  });
}

function registerRoutes(
  { routes, providers }: SetupFastifyParams,
  fastifyInstance: FastifyInstance
) {
  const context = providers.getModule();
  for (const { route, method, getModule } of routes) {
    console.log(`[${method.toUpperCase()}] ${route}`);
    const { handle, schema }: Resource = getModule();

    fastifyInstance[method](route, async (request, reply) => {
      if (schema) {
        const bodyParsed = schema.safeParse(request.body);

        if (bodyParsed?.success === true) {
          const response = await handle(
            context,
            { ...request, body: bodyParsed, rawBody: request.body },
            reply
          );

          reply.send(response);
        } else {
          reply.status(422).send(bodyParsed.error);
        }
      } else {
        const response = await handle(context, { ...request }, reply);

        reply.send(response);
      }
    });
  }
}

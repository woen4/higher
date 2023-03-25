import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from "fastify";
import { MiddlewareSchema, Resource, RouteSchema } from "../../types";
import type { Server } from "connect";

type SetupFastifyParams = {
  routes: RouteSchema[];
  middlewares: MiddlewareSchema[];
  providers: {
    filePath: string;
    getModule: () => Promise<any>;
  };
  options?: FastifyServerOptions;
};

export const setupFastify = async (params: SetupFastifyParams) => {
  const fastifyInstance = Fastify(params.options);

  await registerRoutes(params, fastifyInstance);

  await registerMiddlewares(params, fastifyInstance);

  return fastifyInstance;
};

async function registerMiddlewares(
  { middlewares }: SetupFastifyParams,
  fastifyInstance: FastifyInstance
) {
  await fastifyInstance.register(require("@fastify/middie"));

  for (const { scope, getModule } of middlewares) {
    const { handle } = await getModule();
    (fastifyInstance as unknown as Server).use(scope, handle);
  }
}

async function registerRoutes(
  { routes, providers }: SetupFastifyParams,
  fastifyInstance: FastifyInstance
) {
  const context = await providers.getModule();
  for (const { filePath, route, method, getModule } of routes) {
    console.log(`[${method.toUpperCase()}] ${route}`);
    const { handle, schema }: Resource = await getModule();

    fastifyInstance[method](
      route,
      async (request: FastifyRequest, reply: FastifyReply) => {
        if (schema) {
          const payload = schema.safeParse(request.body);

          if (payload?.success) {
            const response = await handle(
              context,
              { payload, fastifyRequest: request },
              reply
            );

            reply.send(response);
          } else {
            reply.status(422).send("error" /* payload!.error as any */);
          }
        } else {
          const response = await handle(
            context,
            { fastifyRequest: request },
            reply
          );

          reply.send(response);
        }
      }
    );
  }
}

import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyServerOptions,
} from "fastify";
import { MiddlewareSchema, Resource, RouteSchema } from "../../../types";
import type { Server } from "connect";
import middie from "@fastify/middie";
import { z } from "zod";

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
  for (const { scope, getModule } of middlewares) {
    fastifyInstance.addHook("preParsing", async (request) => {
      if (request.url.includes(scope)) {
        const { handle } = getModule();
        await handle(request);
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
  { routes, providers }: SetupFastifyParams,
  fastifyInstance: FastifyInstance
) {
  const context = providers.getModule();
  for (const { route, method, getModule } of routes) {
    const parsedRoute = route.replace(/\[(.*?)\]/g, ":$1");

    console.log(`[${method.toUpperCase()}] ${parsedRoute}`);

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
}

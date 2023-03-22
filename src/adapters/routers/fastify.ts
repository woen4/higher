import Fastify, {
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from "fastify";
import { Resource, RouteDefinition } from "../../types";

export const setupFastify = async (
  routes: RouteDefinition[],
  context: unknown,
  options?: FastifyServerOptions
) => {
  const fastifyInstance = Fastify(options);

  for (const [filePath, route, method] of routes) {
    console.log(`[${method.toUpperCase()}] ${route}`);
    const { handle, schema }: Resource = await import(filePath);

    fastifyInstance[method](
      route,
      async (request: FastifyRequest, reply: FastifyReply) => {
        if (schema) {
          const payload = schema?.safeParse(request.body);

          if (payload?.success) {
            const response = await handle(
              context,
              { payload, fastifyRequest: request },
              reply
            );

            reply.send(response);
          } else {
            reply.status(400).send(payload?.error);
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

  return fastifyInstance;
};

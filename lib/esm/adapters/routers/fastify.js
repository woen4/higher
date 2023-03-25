import Fastify from "fastify";
export const setupFastify = async (params) => {
    const fastifyInstance = Fastify(params.options);
    await registerRoutes(params, fastifyInstance);
    await registerMiddlewares(params, fastifyInstance);
    return fastifyInstance;
};
async function registerMiddlewares({ middlewares }, fastifyInstance) {
    await fastifyInstance.register(require("@fastify/middie"));
    for (const { scope, getModule } of middlewares) {
        const { handle } = await getModule();
        fastifyInstance.use(scope, handle);
    }
}
async function registerRoutes({ routes, providers }, fastifyInstance) {
    const context = await providers.getModule();
    for (const { filePath, route, method, getModule } of routes) {
        console.log(`[${method.toUpperCase()}] ${route}`);
        const { handle, schema } = await getModule();
        fastifyInstance[method](route, async (request, reply) => {
            if (schema) {
                const payload = schema.safeParse(request.body);
                if (payload?.success) {
                    const response = await handle(context, { payload, fastifyRequest: request }, reply);
                    reply.send(response);
                }
                else {
                    reply.status(422).send("error" /* payload!.error as any */);
                }
            }
            else {
                const response = await handle(context, { fastifyRequest: request }, reply);
                reply.send(response);
            }
        });
    }
}

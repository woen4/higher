/// <reference types="node" />
import { FastifyInstance, FastifyServerOptions } from "fastify";
import { MiddlewareSchema, RouteSchema } from "../../types";
type SetupFastifyParams = {
    routes: RouteSchema[];
    middlewares: MiddlewareSchema[];
    providers: {
        filePath: string;
        getModule: () => Promise<any>;
    };
    options?: FastifyServerOptions;
};
export declare const setupFastify: (params: SetupFastifyParams) => Promise<FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>>;
export {};
//# sourceMappingURL=fastify.d.ts.map
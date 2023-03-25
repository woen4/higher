/// <reference types="node" />
import { MiddlewareSchema, RouteSchema } from "./types";
import { FastifyServerOptions } from "fastify";
export declare function bootstrap(dirname: string, options?: FastifyServerOptions): Promise<import("fastify").FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>>;
export declare function mapDirectory(dirname: string): Promise<{
    routes: RouteSchema[];
    middlewares: MiddlewareSchema[];
    providers: {
        filePath: string;
    };
}>;
//# sourceMappingURL=index.d.ts.map
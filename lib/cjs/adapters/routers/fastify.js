"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFastify = void 0;
const fastify_1 = __importDefault(require("fastify"));
const setupFastify = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const fastifyInstance = (0, fastify_1.default)(params.options);
    yield registerRoutes(params, fastifyInstance);
    yield registerMiddlewares(params, fastifyInstance);
    return fastifyInstance;
});
exports.setupFastify = setupFastify;
function registerMiddlewares({ middlewares }, fastifyInstance) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fastifyInstance.register(require("@fastify/middie"));
        for (const { scope, getModule } of middlewares) {
            const { handle } = yield getModule();
            fastifyInstance.use(scope, handle);
        }
    });
}
function registerRoutes({ routes, providers }, fastifyInstance) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield providers.getModule();
        for (const { filePath, route, method, getModule } of routes) {
            console.log(`[${method.toUpperCase()}] ${route}`);
            const { handle, schema } = yield getModule();
            fastifyInstance[method](route, (request, reply) => __awaiter(this, void 0, void 0, function* () {
                if (schema) {
                    const payload = schema.safeParse(request.body);
                    if (payload === null || payload === void 0 ? void 0 : payload.success) {
                        const response = yield handle(context, { payload, fastifyRequest: request }, reply);
                        reply.send(response);
                    }
                    else {
                        reply.status(422).send("error" /* payload!.error as any */);
                    }
                }
                else {
                    const response = yield handle(context, { fastifyRequest: request }, reply);
                    reply.send(response);
                }
            }));
        }
    });
}

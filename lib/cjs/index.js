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
exports.mapDirectory = exports.bootstrap = void 0;
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const fastify_1 = require("./adapters/routers/fastify");
const fs_1 = __importDefault(require("fs"));
const schema_1 = require("./generated/schema");
function bootstrap(dirname, options) {
    return __awaiter(this, void 0, void 0, function* () {
        /* Load routes */
        return (0, fastify_1.setupFastify)(Object.assign(Object.assign({}, schema_1.schema), { options }));
    });
}
exports.bootstrap = bootstrap;
function mapDirectory(dirname) {
    return __awaiter(this, void 0, void 0, function* () {
        const directoryFiles = yield getDirectoryFiles(dirname);
        const routes = getRoutes(directoryFiles);
        const middlewares = getMiddlewares(directoryFiles);
        const providers = getProviders(dirname);
        /* Load routes */
        return { routes, middlewares, providers };
    });
}
exports.mapDirectory = mapDirectory;
function getDirectoryFiles(dirname) {
    const filesPaths = path_1.default.resolve(dirname, "**", "*.ts");
    return (0, glob_1.default)(filesPaths);
}
function getMiddlewares(directoryFiles) {
    const middlewares = [];
    for (const filePath of directoryFiles) {
        const isMiddleware = filePath.endsWith("/middleware.ts");
        if (isMiddleware) {
            middlewares.push({
                scope: filePath.match(/src\/modules(.*?)\/middleware.ts/)[1],
                filePath,
            });
        }
    }
    return middlewares;
}
function getRoutes(directoryFiles) {
    const routes = [];
    for (const filePath of directoryFiles) {
        // Ex: /home/pc/user/Documents/project_name/src/modules/users... -> /modules/users
        const filePathFromSrc = filePath.split("src")[1];
        // Match route and method -> /modules/user/get.ts -> /users, get
        const matched = filePathFromSrc.match(/modules(.*?)\/(get|post|patch|delete|put)\.ts/);
        if (matched) {
            const [_, route, method] = matched;
            const parsedRoute = route === "" ? "/" : route;
            routes.push({ filePath, route: parsedRoute, method });
        }
    }
    return routes;
}
function getProviders(dirname) {
    const providersPath = path_1.default.resolve(dirname, "providers");
    if (!fs_1.default.existsSync(providersPath))
        throw new Error("You need a provider folder with a index.ts file inside, in 'src' directory");
    return { filePath: providersPath };
}

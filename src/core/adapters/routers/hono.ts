import { MiddlewareSchema, Resource, RouteSchema } from "../../../types";
import { Context, Env, Hono } from "hono";

export type SetupHonoParams = {
  routes: RouteSchema[];
  middlewares: MiddlewareSchema[];
  providers: {
    filePath: string;
    getModule: () => Promise<any>;
  };
  options?: Pick<Hono, "router" | "strict">;
};

export const setupHono = async (params: SetupHonoParams) => {
  const honoInstance = new Hono(params.options);

  await registerRoutes(params, honoInstance);

  await registerMiddlewares(params, honoInstance);

  return honoInstance;
};

async function registerMiddlewares(
  { middlewares }: SetupHonoParams,
  honoInstance: Hono<Env, {}, "">
) {
  for (const { scope, getModule } of middlewares) {
    const { handle } = getModule();
    honoInstance.use(scope, handle);
  }
}

async function registerRoutes(
  { routes, providers }: SetupHonoParams,
  honoInstance: Hono<Env, {}, "">
) {
  const context = providers.getModule();
  for (const { route, method, getModule } of routes) {
    console.log(`[${method.toUpperCase()}] ${route}`);
    const { handle, schema }: Resource = getModule();

    honoInstance.get(route, async (ctx: Context<Env, string, {}>) => {
      if (schema) {
        const payload = schema.safeParse(ctx.body);

        if (payload.success === true) {
          const response = await handle(context, {
            payload,
            httpContext: ctx,
          });

          ctx.text(JSON.stringify(response));
        } else {
          ctx.text(JSON.stringify(payload.error), 422);
        }
      } else {
        const response = await handle(context, { httpContext: ctx });

        ctx.text(JSON.stringify(response));
      }
    });
  }
}

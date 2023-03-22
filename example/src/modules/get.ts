import { FastifyReply } from "fastify";
import { HigherRequest } from "../../../src/types";
import { Providers } from "../providers";

export const handle = (
  ctx: Providers,
  request: HigherRequest,
  reply: FastifyReply
) => {
  reply.send("ooo");
};

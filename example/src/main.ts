import { bootstrap } from "../../src/main";

async function main() {
  const fastifyInstance = await bootstrap(__dirname);

  fastifyInstance.listen({ port: 3000 });
  console.log("Server is listening");
}

main();

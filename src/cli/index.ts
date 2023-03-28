import { generateSchemaScript } from "../scripts/generateSchema";
import { buildScript } from "../scripts/build";
import { devScript } from "../scripts/dev";

const [node, filePath, command] = process.argv;

switch (command) {
  case "dev":
    devScript(process.cwd(), "build", false);
    break;

  case "dev:hono":
    devScript(process.cwd(), "build", true);
    break;

  case "build":
    buildScript(process.cwd());
    break;
}

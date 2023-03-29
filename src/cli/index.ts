import { buildScript } from "../scripts/build";
import { devScript } from "../scripts/dev";

const [node, filePath, command] = process.argv;

switch (command) {
  case "dev":
    devScript(process.cwd(), "build");
    break;

  case "build":
    buildScript(process.cwd(), "dist");
    break;
}

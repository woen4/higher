import chalk from "chalk";
import { buildScript } from "../scripts/build";
import { devScript } from "../scripts/dev";
import { startScript } from "../scripts/start";

const [node, filePath, command] = process.argv;

switch (command) {
  case "dev":
    console.log(chalk.bold.redBright("⚡️ Higher ⚡️"));
    devScript(process.cwd(), "build");
    break;

  case "build":
    console.log(chalk.bold.redBright("⚡️ Higher ⚡️"));
    buildScript(process.cwd(), "dist");
    break;

  case "start":
    console.log(chalk.bold.redBright("⚡️ Higher ⚡️"));
    startScript("dist");
    break;
}

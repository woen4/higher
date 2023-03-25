import { exec } from "child_process";
import path from "path";
import { devScript } from "../scripts/dev";

const [node, filePath, command] = process.argv;

switch (command) {
  case "dev":
    devScript(process.cwd());

  case "build":
    exec(
      `pnpm tsx ${path.resolve(
        __dirname,
        "..",
        "lib",
        "cjs",
        "scripts",
        "dev.js"
      )} ${process.cwd()}`
    ).stdout.pipe(process.stdout);
}

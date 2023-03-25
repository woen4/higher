const { exec } = require("child_process");
const path = require("path");

const [node, filePath, command] = process.argv;

switch (command) {
  case "dev":
    exec(
      `pnpm tsx ${path.resolve(
        __dirname,
        "..",
        "scripts",
        "dev.ts"
      )} ${process.cwd()}`
    ).stdout.pipe(process.stdout);
}

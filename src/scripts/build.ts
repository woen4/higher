import chalk from "chalk";
import { exec } from "child_process";
import { generateSchemaScript } from "./generateSchema";

export const buildScript = async (projectDir: string, outDir: string) => {
  console.log(chalk.green("Generating routes schema..."));
  await generateSchemaScript(projectDir, outDir);

  console.log(chalk.green("Starting build..."));

  const buildCProcess = exec(
    `npx tsup src '!**/*.spec.*' '!**/*.mock.*' '!get**/*.test.*' --minify --clean -d ${outDir}`
  );
  buildCProcess.stderr.pipe(process.stderr);
  buildCProcess.stdout.pipe(process.stdout);
};

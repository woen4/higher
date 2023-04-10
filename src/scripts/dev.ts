import chalk from "chalk";
import { exec } from "child_process";
import { Writable } from "stream";
import { generateSchemaScript } from "./generateSchema";

const isBuildLog = (log: string) =>
  log.startsWith("CLI") || log.startsWith("CJS") || log.startsWith("ESM");

const customStdout = new Writable({
  write: function (chunk: any, encoding, next) {
    const line: string = Buffer.from(chunk).toString("utf-8").trim();

    if (!isBuildLog(line)) {
      console.log(line);
    }
    next();
  },
});

export const devScript = async (projectDir: string, outDir: string) => {
  console.log(chalk.green("Generating routes schema..."));

  await generateSchemaScript(projectDir, outDir);

  console.log(chalk.green("Starting server in watch mode..."));

  const buildCProcess = exec(
    `npx tsup src --watch --onSuccess 'FORCE_COLOR=3 node ${outDir}/index.js' -d ${outDir}`
  );
  buildCProcess.stderr.pipe(process.stderr);
  buildCProcess.stdout.pipe(customStdout);
};

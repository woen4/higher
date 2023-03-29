import path from "path";
import { exec } from "child_process";
import { mapDirectory } from "../core/directoryMapper";
import { writeFile } from "fs/promises";
import { generateSchemaScript } from "./generateSchema";

export const buildScript = async (projectDir: string, outDir: string) => {
  await generateSchemaScript(projectDir, outDir);

  const buildCProcess = exec(`npx tsup src -d ${outDir}`);
  buildCProcess.stderr.pipe(process.stderr);
  buildCProcess.stdout.pipe(process.stdout);
};

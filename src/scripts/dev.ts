import { exec } from "child_process";
import { generateSchemaScript } from "./generateSchema";

export const devScript = async (projectDir: string, outDir: string) => {
  await generateSchemaScript(projectDir, outDir);

  const buildCProcess = exec(
    `npx tsup src --watch --onSuccess 'node ${outDir}/index.js' -d ${outDir}`
  );
  buildCProcess.stderr.pipe(process.stderr);
  buildCProcess.stdout.pipe(process.stdout);
};

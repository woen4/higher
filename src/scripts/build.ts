import { exec } from "child_process";
import { generateSchemaScript } from "./generateSchema";

export const buildScript = async (projectDir: string, outDir: string) => {
  await generateSchemaScript(projectDir, outDir);

  const buildCProcess = exec(
    `npx tsup src '!**/*.spec.*' '!**/*.mock.*' '!get**/*.test.*' --minify -d ${outDir}`
  );
  buildCProcess.stderr.pipe(process.stderr);
  buildCProcess.stdout.pipe(process.stdout);
};

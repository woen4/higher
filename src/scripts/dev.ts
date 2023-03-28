import { exec } from "child_process";
import { generateSchemaScript } from "./generateSchema";

export const devScript = async (
  projectDir: string,
  outDir: string,
  isHonoRouter: boolean
) => {
  await generateSchemaScript(projectDir, outDir);

  if (isHonoRouter) {
    const buildCProcess = exec(`npx tsup src --watch -d ${outDir}`);
    buildCProcess.stderr.pipe(process.stderr);
    buildCProcess.stdout.pipe(process.stdout);

    const cProcess = exec(`npx wrangler dev src/index.ts`);
    cProcess.stderr.pipe(process.stderr);
    cProcess.stdout.pipe(process.stdout);
  } else {
    const cProcess = exec(
      `npx tsup src --watch --onSuccess 'node ${outDir}/index.js' -d ${outDir}`
    );
    cProcess.stderr.pipe(process.stderr);
    cProcess.stdout.pipe(process.stdout);
  }
};

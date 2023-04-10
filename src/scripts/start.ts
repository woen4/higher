import { exec } from "child_process";

export const startScript = async (outDir: string) => {
  const buildCProcess = exec(
    `FORCE_COLOR=3 node ${outDir}/index.js -d ${outDir}`
  );
  buildCProcess.stderr.pipe(process.stderr);
  buildCProcess.stdout.pipe(process.stdout);
};

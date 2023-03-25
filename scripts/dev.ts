import path from "path";
import { exec } from "child_process";
import { watch } from "chokidar";
import { mapDirectory } from "../src";
/* import { sourceDirectory } from "../higher.config.json"; */
import { writeFile } from "fs/promises";

const [node, filePath, dirname] = process.argv;

let isReady = false;

const generateSchema = async () => {
  if (!isReady) return;

  const schema = await mapDirectory(path.resolve(dirname, "src"));

  const updatedSchema = JSON.stringify(schema)
    //Apply getModule property
    .replace(
      /"filePath":\s*"([^"]+)?"/g,
      '"filePath": "$1", "getModule": () => import("$1")'
    )
    //Remove .ts extension in import
    .replace(/import\("(.*?).ts"\)/g, 'import("$1")');

  await writeFile(
    path.resolve(__dirname, "..", "src", "generated", "schema.ts"),
    `export const schema = ${updatedSchema}`
  );

  exec(
    "pnpm tsup src/index.ts --watch --onSuccess 'node dist/index.js'"
  ).stdout.pipe(process.stdout);
};

watch(path.resolve(dirname))
  .on("ready", () => {
    isReady = true;
    generateSchema();
  })
  /* .on("change", buildAndRun) */
  .on("add", generateSchema)
  .on("addDir", generateSchema)
  .on("unlink", generateSchema)
  .on("unlinkDir", generateSchema);

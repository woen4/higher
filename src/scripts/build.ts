import path from "path";
import { exec } from "child_process";
import { watch } from "chokidar";
import { mapDirectory } from "../index";
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
      '"filePath": "$1", "getModule": () => require("$1")'
    )
    //Remove .ts extension in import
    .replace(/require\("(.*?).ts"\)/g, 'require("$1")')
    .replace(/src/g, "dist");

  // This generate schema inside node_modules
  await writeFile(
    path.resolve(__dirname, "..", "src", "generated", "schema.js"),
    `exports.schema = ${updatedSchema}`
  );

  //This run in target project directory
  exec("pnpm tsup src --watch --onSuccess 'node dist/index.js'").stdout.pipe(
    process.stdout
  );
};

watch(path.resolve(dirname))
  .on("ready", () => {
    isReady = true;
    generateSchema();
  })
  .on("add", generateSchema)
  .on("addDir", generateSchema)
  .on("unlink", generateSchema)
  .on("unlinkDir", generateSchema);

import path from "path";
import { exec } from "child_process";
import { watch } from "chokidar";
import { mapDirectory } from "../index";
import { writeFile } from "fs/promises";

export const devScript = (projectDir: string) => {
  let isReady = false;

  const generateSchema = async () => {
    if (!isReady) return;

    const schema = await mapDirectory(path.resolve(projectDir, "src"));

    const updatedSchema = JSON.stringify(schema)
      //Apply getModule property
      .replace(
        /"filePath":\s*"([^"]+)?"/g,
        '"filePath": "$1", "getModule": () => require("$1")'
      )
      //Remove .ts extension in import
      .replace(/require\("(.*?).ts"\)/g, 'require("$1")')
      .replace(/src/g, "dist");

    await writeFile(
      path.resolve(__dirname, "..", "generated", "schema.js"),
      `exports.schema = ${updatedSchema}`
    );

    exec("pnpm tsup src --watch --onSuccess 'node dist/index.js'").stdout.pipe(
      process.stdout
    );
  };

  watch(path.resolve(projectDir))
    .on("ready", () => {
      isReady = true;
      generateSchema();
    })
    .on("add", generateSchema)
    .on("addDir", generateSchema)
    .on("unlink", generateSchema)
    .on("unlinkDir", generateSchema);
};

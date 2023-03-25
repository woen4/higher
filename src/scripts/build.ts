import path from "path";
import { exec } from "child_process";
import { mapDirectory } from "../core/directoryMapper";
import { writeFile } from "fs/promises";

export const buildScript = async (projectDir: string) => {
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

  exec("npm exec ncc build src/index.ts").stdout.pipe(process.stdout);
};

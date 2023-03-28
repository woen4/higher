import { writeFile } from "fs/promises";
import path from "path";
import { mapDirectory } from "../core/directoryMapper";

export const generateSchemaScript = async (
  projectDir: string,
  outDir: string
) => {
  const schema = await mapDirectory(path.resolve(projectDir, "src"));

  const updatedSchema = JSON.stringify(schema)
    //Apply getModule property
    .replace(
      /"filePath":\s*"([^"]+)?"/g,
      '"filePath": "$1", "getModule": () => require("$1")'
    )
    //Remove .ts extension in import
    .replace(/require\("(.*?).ts"\)/g, 'require("$1")')
    .replace(/src/g, outDir);

  const schemaFileContent = `exports.schema = ${updatedSchema}`;

  await writeFile(
    path.resolve(__dirname, "..", "generated", "schema.js"),
    schemaFileContent
  );

  await writeFile(
    path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "esm",
      "src",
      "generated",
      "schema.js"
    ),
    schemaFileContent
  );

  console.log("Generated route schema !");

  /*   watch(path.resolve(projectDir))
    .on("ready", () => {
      isReady = true;
      generateSchema();
    })
    .on("add", generateSchema)
    .on("addDir", generateSchema)
    .on("unlink", generateSchema)
    .on("unlinkDir", generateSchema); */
};

const fs = require("fs");
const path = require("path");

const srcDir = path.join(".", "uncompiled");
const destDir = path.join(".", "compiled");
const requiredFiles = ["stream"];

if (!fs.existsSync(destDir) || fs.readdirSync(destDir).length === 0) {
  fs.readdir(srcDir, (err, folders) => {
    if (err) {
      console.error("Error reading source directory:", err);
      return;
    }

    folders.forEach((folder) => {
      const srcFxManifest = path.join(srcDir, folder, "fxmanifest.lua");
      const srcResourceLua = path.join(srcDir, folder, "__resource.lua");
      
      // Check if either manifest exists
      const hasManifestFile = fs.existsSync(srcFxManifest) || fs.existsSync(srcResourceLua);

      let hasAllRequiredFiles =
        requiredFiles.every((file) =>
          fs.existsSync(path.join(srcDir, folder, file))
        ) && hasManifestFile;

      if (hasAllRequiredFiles) {
        let srcDataDir = path.join(srcDir, folder, "data");
        let destDataDir = path.join(destDir, "data", "[" + folder + "]");

        if (!fs.existsSync(srcDataDir)) {
          srcDataDir = path.join(srcDir, folder);
        }

        let srcStreamDir = path.join(srcDir, folder, "stream");
        let destStreamDir = path.join(destDir, "stream", "[" + folder + "]");
        fs.mkdirSync(destStreamDir, { recursive: true });
        copyFiles(srcStreamDir, destStreamDir);

        fs.mkdirSync(destDataDir, { recursive: true });
        copyMetaFiles(srcDataDir, destDataDir);

        // Always generate a fresh fxmanifest.lua
        const destManifest = path.join(destDir, "fxmanifest.lua");
        generateFxManifest(destManifest);

      }
    });

    console.log("Process completed successfully.");
  });
} else {
  console.log(`The 'compiled' directory is not empty.`);
}

function copyFile(src, dest) {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    } else {
      console.log(`File does not exist: ${src}, skipping copy.`);
    }
  } catch (err) {
    console.error("Error copying file:", err);
  }
}

function copyFiles(srcDir, destDir) {
  fs.readdir(srcDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      let srcFile = path.join(srcDir, file);
      let destFile = path.join(destDir, file);
      copyFile(srcFile, destFile);
    });
  });
}

function copyMetaFiles(srcDir, destDir) {
  fs.readdir(srcDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files
      .filter((file) => path.extname(file) === ".meta")
      .forEach((file) => {
        let srcFile = path.join(srcDir, file);
        let destFile = path.join(destDir, file);
        copyFile(srcFile, destFile);
      });
  });
}

function generateFxManifest(filePath) {
  const content = `fx_version "cerulean"
game "gta5"

files {
  'data/**/handling.meta',
  'data/**/vehicles.meta',
  'data/**/carcols.meta',
  'data/**/carvariations.meta',
  'data/**/vehiclelayouts.meta',
}

data_file 'HANDLING_FILE' 'data/**/handling.meta'
data_file 'VEHICLE_METADATA_FILE' 'data/**/vehicles.meta'
data_file 'CARCOLS_FILE' 'data/**/carcols.meta'
data_file 'VEHICLE_VARIATION_FILE' 'data/**/carvariations.meta'
data_file 'VEHICLE_LAYOUTS_FILE' 'data/**/vehiclelayouts.meta'
`;
  fs.writeFileSync(filePath, content);
}

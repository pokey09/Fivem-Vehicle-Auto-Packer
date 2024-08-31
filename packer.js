const fs = require("fs");
const path = require("path");

const srcDir = path.join(".", "uncompiled");
const destDir = path.join(".", "compiled");
const requiredFiles = ["stream", "__resource.lua"];

// Check if the compiled folder exists and is empty
if (!fs.existsSync(destDir) || fs.readdirSync(destDir).length === 0) {
  fs.readdir(srcDir, (err, folders) => {
    if (err) {
      console.error("Error reading source directory:", err);
      return;
    }

    folders.forEach((folder) => {
      let hasAllRequiredFiles = requiredFiles.every((file) =>
        fs.existsSync(path.join(srcDir, folder, file))
      );

      if (hasAllRequiredFiles) {
        // Copy the files from uncompiled/FOLDER/stream to compiled/stream/FOLDER
        let srcStreamDir = path.join(srcDir, folder, "stream");
        let destStreamDir = path.join(destDir, "stream", "[" + folder + "]");
        fs.mkdirSync(destStreamDir, { recursive: true });
        copyFiles(srcStreamDir, destStreamDir);

        // Copy .meta files from uncompiled/FOLDER to compiled/data/FOLDER
        let srcDataDir = path.join(srcDir, folder);
        let destDataDir = path.join(destDir, "data", "[" + folder + "]");
        fs.mkdirSync(destDataDir, { recursive: true });
        copyMetaFiles(srcDataDir, destDataDir);
      }
    });

    // Create fxmanifest.lua in the compiled directory
    let destManifest = path.join(destDir, "fxmanifest.lua");
    let content = `
      fx_version 'bodacious'
      game 'gta5'

      files {
        'data/**/*.meta'
      }

      data_file 'VEHICLE_LAYOUTS_FILE' 'data/**/vehiclelayouts.meta'
      data_file 'VEHICLE_METADATA_FILE' 'data/**/vehicles.meta'
      data_file 'CARCOLS_FILE' 'data/**/carcols.meta'
      data_file 'VEHICLE_VARIATION_FILE' 'data/**/carvariations.meta'
      data_file 'HANDLING_FILE' 'data/**/handling.meta'
    `;

    try {
      fs.writeFileSync(destManifest, content, "utf8");
    } catch (err) {
      console.error("Error writing file:", err);
    }

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

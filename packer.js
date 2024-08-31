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
      const manifestFiles = ["fxmanifest.lua", "__resource.lua"];
      const hasManifestFile = manifestFiles.some((file) =>
        fs.existsSync(path.join(srcDir, folder, file))
      );

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

        manifestFiles.forEach((file) => {
          const srcManifest = path.join(srcDir, folder, file);
          const destManifest = path.join(destDir, file);
          if (fs.existsSync(srcManifest)) {
            copyFile(srcManifest, destManifest);
          }
        });
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

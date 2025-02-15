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

        // Handle manifest file
        const destManifest = path.join(destDir, "fxmanifest.lua");
        
        if (fs.existsSync(srcFxManifest)) {
          // If fxmanifest.lua exists, copy it
          copyFile(srcFxManifest, destManifest);
        } else if (fs.existsSync(srcResourceLua)) {
          // If __resource.lua exists, convert it to fxmanifest.lua
          const content = fs.readFileSync(srcResourceLua, 'utf8');
          const updatedContent = convertToFxManifest(content);
          fs.writeFileSync(destManifest, updatedContent);
        }
      }
    });

    console.log("Process completed successfully.");
  });
} else {
  console.log(`The 'compiled' directory is not empty.`);
}

function convertToFxManifest(content) {
  // Start with the new manifest header
  let newContent = 'fx_version "cerulean"\ngame "gta5"\n\n';
  
  // Convert the content
  let lines = content.split('\n');
  lines = lines.filter(line => {
    // Remove old resource_manifest_version line
    return !line.includes('resource_manifest_version');
  });
  
  // Add the remaining lines
  newContent += lines.join('\n');
  
  return newContent;
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

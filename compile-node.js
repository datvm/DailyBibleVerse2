const fs = require("fs")
const path = require("path")

const excludeFolders = ["dts", "node_modules", ".vscode"];
const excludedExts = [".map", ".ts", ".scss", "tsconfig.json", "package.json", "package-lock.json", "yarn.lock"];

function copyExclude(src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (excludeFolders.find(q => src.toLowerCase().endsWith(q))) {
            console.log("Skipping folder: " + src);
            return;
        }

        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function (childItemName) {
            copyExclude(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        if (excludedExts.find(q => src.toLowerCase().endsWith(q))) {
            console.log("Skipping: " + src);
            return;
        }

        fs.copyFileSync(src, dest);
    }
};

const src = ".\\ChromeExt";
const dest = ".\\bin";

try {
    fs.rmdirSync(dest, {
        recursive: true,
    });
} catch (e) { }

copyExclude(src, dest);
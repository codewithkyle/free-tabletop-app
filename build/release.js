const fs = require("fs");
const path = require("path");
const cwd = process.cwd();
const glob = require("glob");

const project = require(path.join(cwd, "package.json"));
const publicDir = path.join(cwd, "Client", "wwwroot");
const data = {
    cache: [
        "/",
    ],
};

if (fs.existsSync(path.join(publicDir, "app.json"))){
    fs.unlinkSync(path.join(publicDir, "app.json"));
}

// Bumb patch number
const patchNumber = parseInt(project.version.replace(/.*\./, "")) + 1;
const newVersion = `${project.version.match(/.*\./)[0]}${patchNumber}`;
data.build = newVersion;

// Bumb version in package.json
let package = fs.readFileSync(path.join(cwd, "package.json")).toString();
package = package.replace(/\"version\"\:.*/g, `"version": "${newVersion}",`);
fs.writeFileSync(path.join(cwd, "package.json"), package);

// Set build date
const date = new Date();
data.released = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

// Build cache list
const cssFiles = glob.sync(`${publicDir}/css/*.css`);
for (let i = 0; i < cssFiles.length; i++){
    const file = cssFiles[i].replace(/.*[\\\/]/, "");
    data.cache.push(`/css/${file}`);
}
const jsFiles = glob.sync(`${publicDir}/js/*.js`);
for (let i = 0; i < jsFiles.length; i++){
    const file = jsFiles[i].replace(/.*[\\\/]/, "");
    data.cache.push(`/js/${file}`);
}
const sfxFiles = glob.sync(`${publicDir}/sfx/*`);
for (let i = 0; i < sfxFiles.length; i++){
    const file = sfxFiles[i].replace(/.*[\\\/]/, "");
    data.cache.push(`/sfx/${file}`);
}

fs.writeFileSync(path.join(publicDir, "app.json"), JSON.stringify(data));
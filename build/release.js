const fs = require("fs");
const path = require("path");
const cwd = process.cwd();
const glob = require("glob");

const project = require(path.join(cwd, "package.json"));
const publicDir = path.join(cwd, "Client", "wwwroot");
const data = {};

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

fs.writeFileSync(path.join(publicDir, "app.json"), JSON.stringify(data));
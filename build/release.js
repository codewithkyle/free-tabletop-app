const fs = require("fs");
const path = require("path");
const cwd = process.cwd();

const project = require(path.join(cwd, "package.json"));
const publicDir = path.join(cwd, "Client", "wwwroot");

if (fs.existsSync(path.join(publicDir, "app.json"))){
    fs.unlinkSync(path.join(publicDir, "app.json"));
}

// Set build version
const data = {
    build: project.version,
};

// Set build date
const date = new Date();
data.released = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

fs.writeFileSync(path.join(publicDir, "app.json"), JSON.stringify(data));
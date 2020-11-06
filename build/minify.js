const fs = require("fs");
const glob = require("glob");
const { minify } = require("terser");
const path = require("path");
const cwd = process.cwd();

const options = {
    ecma: 2017,
    compress: {
        drop_console: true,
        keep_infinity: true,
        module: true,
        dead_code: false,
        keep_fnames: true,
        unused: false,
    },
    mangle: {
        module: true,
        keep_fnames: true,
    },
};

async function run(){
    const files = glob(`${cwd}/_js/*.js`, (err, files) => {
        if (err){
            console.log(err);
            process.exit(1);
        }

        let finished = 0;
        for (let i = 0; i < files.length; i++){
            fs.readFile(files[i], (err, buffer) => {
                if (err){
                    console.log(err);
                    process.exit(1);
                }
                const file = files[i].replace(/.*\//, "");
                const data = buffer.toString();
                const code = {};
                code[file] = data;
                minify(code, options).then(result => {
                    fs.writeFile(path.join(cwd, "Client", "wwwroot", "js", file), result.code, (err) => {
                        if (err){
                            console.log(err);
                            process.exit(1);
                        }
                        finished++;
                        if (finished === files.length){
                            return;
                        }
                    }); 
                });
            });
        }
    });
}
run();
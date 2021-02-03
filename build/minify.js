const fs = require("fs");
const glob = require("glob");
const { minify } = require("terser");
const path = require("path");
const cwd = process.cwd();

const options = {
    ecma: 2019,
    compress: {
        drop_console: true,
        keep_infinity: true,
        module: true,
        dead_code: false,
        keep_fnames: true,
        unused: false,
        keep_classnames: true,
        collapse_vars: false,
        reduce_funcs: false,
        reduce_vars: false,
        unused: false,
    },
    mangle: false,
    keep_classnames: true,
    keep_fnames: true,
};

async function run(){
    await fs.promises.mkdir(path.join(cwd, "Client", "wwwroot", "js", "lib"));
    await fs.promises.mkdir(path.join(cwd, "Client", "wwwroot", "js", "workers"));
    glob(`${cwd}/_js/**/*.js`, (err, files) => {
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
                const file = files[i].replace(/.*[\\\/]/, "");
                const data = buffer.toString();
                const code = {};
                code[file] = data;
                minify(code, options).then(result => {
                    if (files[i].match("lib")){
                        fs.writeFile(path.join(cwd, "Client", "wwwroot", "js", "lib", file), result.code, (err) => {
                            if (err){
                                console.log(err);
                                process.exit(1);
                            }
                            finished++;
                            if (finished === files.length){
                                process.exit(0);
                            }
                        }); 
                    } else if (files[i].match("workers")){
                        fs.writeFile(path.join(cwd, "Client", "wwwroot", "js", "workers", file), result.code, (err) => {
                            if (err){
                                console.log(err);
                                process.exit(1);
                            }
                            finished++;
                            if (finished === files.length){
                                process.exit(0);
                            }
                        }); 
                    } else {
                        fs.writeFile(path.join(cwd, "Client", "wwwroot", "js", file), result.code, (err) => {
                            if (err){
                                console.log(err);
                                process.exit(1);
                            }
                            finished++;
                            if (finished === files.length){
                                process.exit(0);
                            }
                        }); 
                    }
                });
            });
        }
    });
}
run();
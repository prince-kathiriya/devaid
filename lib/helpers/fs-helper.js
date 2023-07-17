
const lodash                          = require('lodash');
const beautify                        = require('js-beautify');
const fs                              = require('fs-extra');
const path                            = require('path');
const chalk                           = require('chalk');


lodash.templateSettings.interpolate   = /{{{([\s\S]+?)}}}/g;



//
// function to get file content from template and replace locals
//
function getFileContent ({ path, locals, options }) {
    options = lodash.assign(
      {
        beautify: true,
        indent_size: 2,
        preserve_newlines: false,
      },
      options || {}
    );

    const template = fs.readFileSync(path, 'utf8');
    locals.projectNames = ['11212', '12121', '5463456345']
    let content = lodash.template(template)(locals || {});

    if (options.beautify) content = beautify(content, options);
    
    return content;
};


//
// function to read directory recursively and return object with key as path and value as isFile flag
//
function readdir(_path, res = {}, _pathToSkeleton = arguments[0], indent = '') {
  //! if path is file, break recursion
  if (fs.statSync(_path).isFile()) return;

  //! read directory and loop through it
  const dirs = fs.readdirSync(_path);
  for (let idx = 0; idx < dirs.length; idx++) {
    const __path = path.resolve(_path, dirs[idx]);
    const isFile = fs.statSync(__path).isFile()
    
    res.log = (res.log || '') +  
      (
        indent + (
          isFile && (idx === dirs.length - 1) ? '└── ' : '├── ')  +
          chalk[isFile ? 'blueBright' : 'yellowBright'].bold(__path.split(_pathToSkeleton)[1].split('/').pop()) +
          '\n'
      )
    res[__path.split(_pathToSkeleton)[1]] = { isFile, srcPath: __path };
    readdir(path.resolve(_path, dirs[idx]), res, _pathToSkeleton, indent + '│   ');
  }
  return res;
}


//
// function to create directory and files
//
function createDirAndFiles({ rootdir, dirs, locals }) {
  const cwd = process.cwd();
  rootdir = path.join(cwd, rootdir);
  fs.ensureDirSync(rootdir);
  for (const dir in dirs) {
    const { isFile, srcPath } = dirs[dir];
    const destPath = path.join(rootdir, dir);
    if (isFile) {
      const content = getFileContent({ path: srcPath, locals, options: { beautify: false } });
      fs.writeFileSync(destPath, content);
    } else fs.ensureDirSync(destPath);
  }
}


//
// read file
//
function readFile({ path }) {
  return fs.readFileSync(path, 'utf8');
}


//
// dir exists
//
function isDirExists({ path }) {
  return fs.pathExistsSync(path);
}


module.exports = {
  getFileContent,
  readdir,
  createDirAndFiles,
  readFile,
  isDirExists,
}

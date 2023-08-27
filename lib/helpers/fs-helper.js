
const lodash                          = require('lodash');
const beautify                        = require('js-beautify');
const fs                              = require('fs-extra');
const path                            = require('path');
const chalk                           = require('chalk');


const csts                            = require('./constants');
const cli                             = require('./cli-helper');
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
    let content = lodash.template(template)(locals || {});

    if (options.beautify) content = beautify(content, options);
    
    return content;
};


//
// function to read directory recursively and return object with key as path and value as isFile flag
//
function readdirrecur(projectRootDir, _path, ignoreExists, replace = {}, res = {}, _pathToSkeleton = arguments[1], indent = '') {
  //! if path is file, break recursion
  if (fs.statSync(_path).isFile()) return;

  //! read directory and loop through it
  const dirs = fs.readdirSync(_path);
  for (let idx = 0; idx < dirs.length; idx++) {
    const __path = path.resolve(_path, dirs[idx]);
    const isFile = fs.statSync(__path).isFile()
    let pathForRes = __path.split(_pathToSkeleton)[1];
    if (Object.keys(replace).length && /{{{([\s\S]+?)}}}/g.test(pathForRes)) {
      for (const key in replace) {
        pathForRes = pathForRes.replaceAll(`{{{ ${key} }}}`, replace[key]);
      }
    }
    const pathToLog = pathForRes.split('/').pop();
    res.log = (res.log || '') +  
      (
        indent + (
          isFile && (idx === dirs.length - 1) ? '└── ' : '├── ')  +
          (isFile ? chalk.blue(pathToLog) : chalk.blue.bold(pathToLog)) +
          '\n'
      )
    res[pathForRes] = { isFile, srcPath: __path };
    
    if (!ignoreExists.includes(pathForRes.substring(1))) {
      const pathToBeCreated = path.join(projectRootDir, pathForRes);
      if (isDirExists({ path: pathToBeCreated })) {
        res.exists = (res.exists || '') + indent + (isFile && (idx === dirs.length - 1) ? '└── ' : '├── ')  + (isFile ? chalk.red(pathToBeCreated) : chalk.red.bold(pathToBeCreated)) + '\n';
      }
    }
    readdirrecur(projectRootDir, path.resolve(_path, dirs[idx]), ignoreExists, replace, res, _pathToSkeleton, indent + '│   ');
  }
  return res;
}


//
// function to create directory and files
//
function createDirAndFiles({ rootdir, dirs, locals }) {
  if (rootdir) {
    rootdir = path.join(process.cwd(), rootdir);
    fs.ensureDirSync(rootdir);
  } else rootdir = process.cwd()
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
// function to get dirs with confirmations
//
async function getDirsToCreate({ pathToSkeleton, root = process.cwd(), ignoreExists = [], replace } = {}) {
  const { log: dirLogs, exists: dirExists, ...dirs } = readdirrecur(root, pathToSkeleton, ignoreExists, replace);

  if (dirExists) {
      console.log('\n' + dirExists);
      console.log(`\n ${csts.PREFIX_MSG_WARNING}${chalk.whiteBright.bold('Above directory structure already exists!')}\n`);
  
      const isConfirmed = await cli.getConfirmation({ message: 'Are you sure to overwrite it? (Y/N): ' });
      if (!isConfirmed) {
          console.log(`\n ${chalk.yellow(csts.PREFIX_MSG)}'Please change directory and try again!' \n`);
          return null;
      }
  }

  //! log directory structure and ask for confirmation
  console.log('\n' + dirLogs);
  console.log(`${chalk.greenBright.bold('Please confirm to create project with above directory structure:')}\n`);


  const isConfirmed = await cli.getConfirmation();
  if (!isConfirmed) {
      console.log(`\n\n ${chalk.yellow(csts.PREFIX_MSG_WARNING)}'Process aborted by user!' \n`);
      return null;
  }
  return dirs;
}


//
// read file
//
function readFile({ path }) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (error) {
    return null;
  }
}


//
// read directory
//
function readDir({ path }) {
  try {
    return fs.readdirSync(path);
  } catch (error) {
    return null;
  }
}


//
// write file
//
function writeFile({ path, content }) {
  try {
    return fs.writeFileSync(path, content);
  } catch (error) {
    return null;
  }
}


//
// dir exists
//
function isDirExists({ path }) {
  return fs.pathExistsSync(path);
}


module.exports = {
  getFileContent,
  readdirrecur,
  createDirAndFiles,
  readFile,
  getDirsToCreate,
  readDir,
  writeFile,
  isDirExists,
}

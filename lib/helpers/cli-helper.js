
const chalk                           = require('chalk');
const enquirer                        = require('enquirer');

const pkg                             = require('../../package.json');
const csts                            = require('./constants');

const Select                          = enquirer.Select;
const Input                           = enquirer.Input;



//
// function to validate input in kebab-case
//
function validateKebabCase(input = '') {
  return !!(input && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(input));
}


//
// function to validate variable name
//
function validateVariableName(input = '') {
  return !!(input && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(input));
}


//
// function to convert string to kebab-case
//
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/\./g, '-')
    .toLowerCase();
}


//
// camelCase to each word capitalized with space
//
function toTitleCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\./g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


//
// function to convert input string in different formates
//
function toAllCaseFormats(input) {
  input = toKebabCase(input);
  return {
    kebabCase: input,
    upperCase: input.toUpperCase().replace(/-/g, '_'),
    snakeCase: input.replace(/-/g, '_'),
    camelCase: input.replace(/-([a-z0-9])/g, (g) => g[1].toUpperCase()),
    pascalCase: input.replace(/-([a-z0-9])/g, (g) => g[1].toUpperCase()).replace(/^[a-z]/, (g) => g.toUpperCase()),
    titleCase: toTitleCase(input),
    dottedSnackCase: input.replace(/-/g, '.').toLowerCase(),
  };
}


//
// function to map choices for a prompt
//
function mapChoices({ choices, disabledIdxStart = -1 } = {}) {
  disabledIdxStart = (choices?.disabledIdxStart ?? disabledIdxStart) - 1;
  return choices.enums.map((choice, idx) => {
    return {
      name: choice?.name || choice,
      hint: '\t' + (choice?.hint || (disabledIdxStart >= 0 && idx > disabledIdxStart ? '[coming soon...]' : '')),
      disabled: disabledIdxStart >= 0 && idx > disabledIdxStart
    }
  });
}


//
// function to get input by select choice
//
async function getInputBySelectChoice({ name, message, choices, margin = [0, 0, 0, 2], hint } = {}) {
  message = message || toTitleCase(name);
  let userInput;
  do {
    const options = {
      name,
      message: `${message}:`,
      choices: mapChoices({ choices }),
      margin,
      hint,
      highlight: true,
    };
    userInput = await new Select(options).run();
    if (choices.disabledIdxStart !== -1) {
      choices.enums = choices.enums.slice(0, choices.disabledIdxStart);
      if (!choices.enums.find((_e_, idx) => ((_e_?.name || _e_) === userInput) && idx <= choices.disabledIdxStart)) {
        userInput = null;
        console.log(`\n ${csts.PREFIX_MSG_ERR} ${chalk.bold('Looks like you have selected disabled option, It will be available soon, please select another option to continue.')}\n`);
      }
    }
  } while (!userInput);
  return userInput;
}


//
// function to get input in kebab-case
//
async function getInputInKebabCase({ name, message } = {}) {

  let isValidInput = true;
  let input = null;
  let hint = 'foo-bar';
  let initial = '';

  message = message || toTitleCase(name);
  
  do {
    if (!isValidInput) 
      hint = 
        !initial 
          ? `:-- Please enter ${message} in kebab-case(lowercase with hyphen) format.`
          : `:-- ${message} must be in kebab-case(lowercase with hyphen) format, press tab to fill with suggested value.`;
    
    const prompt = new Input({
      name,
      message: `${message}\t:`,
      hint,
      initial,
    });

    input = ((await prompt.run() ?? '')).trim();
    isValidInput = validateKebabCase(input);
    if (!isValidInput) initial = toKebabCase(input);

  } while (!isValidInput);
  
  return input;
}


//
// function to get variable name
//
async function getVariableName({ name, message, isExitFlag = true, hint } = {}) {

  let isValidInput = true;
  let input = null;
  hint = hint || 'e.g. fooBar | enter -1 to exit';
  let initial = '';

  message = message || toTitleCase(name);
  
  do {
    if (!isValidInput) hint = `:-- Please enter valid ${message.toLowerCase()}, e.g. fooBar | enter -1 to exit`;
    
    const prompt = new Input({
      name,
      message: `${message}:`,
      hint,
      initial,
    });

    input = ((await prompt.run() ?? '')).trim();
    isValidInput = !!((isExitFlag && +input === -1) || validateVariableName(input));
    if (!isValidInput) initial = input.replace(/^[^a-zA-Z_$]|[^0-9a-zA-Z_$]/g, '');
  } while (!isValidInput);
  
  return input;
}


//
// function to get confirmation
//
async function getConfirmation({ message } = {}) {
  let out;
  do {
    out = await new Input({
      message: message ? chalk.whiteBright.bold(message) : chalk.whiteBright.bold(`Press Y to continue, or N to cancel:`),
    }).run();
    if (!['y', 'n', 'yes', 'no',].includes(out.toLowerCase())) out = null;
  } while (!out);
  return out.toLowerCase() === 'y';
}


//
// function to display help prompt
//
function displayUsage() {
  console.log('');
  console.log('usage: devaid [options] <command>')
  console.log('');
  console.log('devaid -h, --help             all available commands and options');
  console.log('devaid examples               display devaid usage examples');
  console.log('devaid <command> -h           help on a specific command\n');
}


//
// function to display examples of usage
//
function displayExamples() {
  console.log('- Start and add a process to the devaid process list:')
  console.log('');
  console.log(chalk.cyan('  $ devaid start app.js --name app'));
  console.log('');
}


//
// handle catch error and exit
//
function catchExit(error) {
  //! user cancelled the prompt
  if (error === '') {
    console.log('\n', csts.PREFIX_MSG_WARNING + chalk.bold('Process aborted!\n'));
    return process.exit(csts.SIGINT_EXIT);
  }

  //! if debug mode, print stack and error
  if (csts.DEBUG) console.error('\n', error.stack || error);

  //! something went wrong
  console.log('\n', csts.PREFIX_MSG_ERR, chalk.bold('Something went wrong'));
  console.log('\n', chalk.red.bold(error));
  console.log('\n', chalk.yellow.bold('Please report this issue on: ' + chalk.cyan(pkg.bugs.url)) + ', with steps to reproduce. Thank you!');
}


//
// function to fail when unknown command arguments are passed
//
function failOnUnknown(fn) {
  return function(arg) {
    if (arguments.length > 1) {
      console.log(csts.PREFIX_MSG + '\nUnknown command argument: ' + arg);
      command.outputHelp();
      process.exit(csts.ERROR_EXIT);
    }
    return fn.apply(this, arguments);
  };
}


module.exports = {
  validateKebabCase,
  toKebabCase,
  toTitleCase,
  toAllCaseFormats,


  mapChoices,
  getInputBySelectChoice,
  getInputInKebabCase,
  getVariableName,
  getConfirmation,


  displayUsage,
  displayExamples,
  
  
  catchExit,
  failOnUnknown,
}

// 'use strict';

const commander                          = require('commander');
const chalk                              = require('chalk');

const pkg                                = require('../../../../package.json');
const helper                             = require('../../../helpers');
const setupserver                        = require('./setup-server');
const setupcrud                          = require('./setup-crud');

const command                            = new commander.Command();



//
// commander options declaration
//
command.version(pkg.version)
  .option('-h, --help', 'output usage information')
  .option('<command> -h, --help', 'help on a specific command')
  .usage('<command>');


//
// setup server for backend apis 
//
command
  .command('setup-server')
  .alias('ss')
  .description('to generate server files for backend apis.')
  .action(setupserver.action);


//
// setup server for backend apis 
//
command
  .command('setup-crud')
  .alias('scrud')
  .description('to generate crud files for backend apis.')
  .action(setupcrud.action);


//
// catch all unknown commands
//
command.command('*')
  .action(function() {
    console.log(helper.csts.PREFIX_MSG_ERR + chalk.bold('Command not found'));
    helper.cli.displayUsage();
    
    //! check if it does not forget to close fds from RPC
    process.exit(helper.csts.ERROR_EXIT);
  });


console.log('');
command.parse();
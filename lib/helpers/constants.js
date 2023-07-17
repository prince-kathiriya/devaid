
var chalk          = require('chalk');



//
// constants variables used by DEVAID
//
var csts = {
  PREFIX_MSG                    : chalk.green('[DEVAID] '),
  PREFIX_MSG_INFO               : chalk.cyan('[DEVAID][INFO] '),
  PREFIX_MSG_VALIDATION_ERROR   : chalk.red('[DEVAID][VALIDATION] '),
  PREFIX_MSG_ERR                : chalk.red('[DEVAID][ERROR] '),
  PREFIX_MSG_WARNING            : chalk.yellow('[DEVAID][WARN] '),
  PREFIX_MSG_SUCCESS            : chalk.cyan('[DEVAID] '),

  SUCCESS_EXIT                  : 0,
  ERROR_EXIT                    : 1,
  CODE_UNCAUGHTEXCEPTION        : 1,
  SIGINT_EXIT                   : 0,
  SIGTERM_EXIT                  : 0,

  IS_WINDOWS                    : (process.platform === 'win32' || process.platform === 'win64' || /^(msys|cygwin)$/.test(process.env.OSTYPE)),
  DEFAULT_MODULE_JSON           : 'package.json',

  DEBUG                         : process.env.DEVAID_DEBUG || false,
  WEB_IPADDR                    : process.env.DEVAID_API_IPADDR || '0.0.0.0',
  WEB_PORT                      : parseInt(process.env.DEVAID_API_PORT)  || 9615,
  WEB_STRIP_ENV_VARS            : process.env.DEVAID_WEB_STRIP_ENV_VARS || false,
  MODIFY_REQUIRE                : process.env.DEVAID_MODIFY_REQUIRE || false,

  WORKER_INTERVAL               : process.env.DEVAID_WORKER_INTERVAL || 30000,
  KILL_TIMEOUT                  : process.env.DEVAID_KILL_TIMEOUT || 1600,
  KILL_SIGNAL                   : process.env.DEVAID_KILL_SIGNAL || 'SIGINT',
  KILL_USE_MESSAGE              : process.env.DEVAID_KILL_USE_MESSAGE || false,

  DEVAID_PROGRAMMATIC           : typeof(process.env.pm_id) !== 'undefined' || process.env.DEVAID_PROGRAMMATIC,
  DEVAID_LOG_DATE_FORMAT        : process.env.DEVAID_LOG_DATE_FORMAT !== undefined ? process.env.DEVAID_LOG_DATE_FORMAT : 'YYYY-MM-DDTHH:mm:ss'
};


module.exports = csts;

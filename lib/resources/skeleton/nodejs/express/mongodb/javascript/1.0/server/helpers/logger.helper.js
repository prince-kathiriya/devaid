const { format, transports, createLogger } = require('winston');

const levels = {
  error: 0,   debug: 3,    silly: 6,
  warn: 1,    http: 4,     request: 7,
  info: 2,    verbose: 5,  response: 8,
  
};

const levelRegex = new RegExp(`(${Object.keys(levels).join('|')})`, 'i');
const devLogFormat = format.printf(({ level, message, timestamp, stack, ms }) => 
    `${level.replace(levelRegex, (level) => level.toUpperCase())} [${timestamp}]: ${stack || message} [${ms}]`
)

const logger = createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'debug',
  format: 
    format.combine(
      ...(process.env.NODE_ENV === 'development' ? [format.colorize({ all: true })] : []),
      format.timestamp({ ...(process.env.NODE_ENV === 'development' && { format: 'DD-MM-YYYY HH:mm:ss:ms Z' }) }),
      format.ms(),
      format.errors({ stack: true }),
      process.env.NODE_ENV === 'development' ? devLogFormat : format.json()
    ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console(),
    ...(process.env.NODE_ENV !== 'development'
      ? [
          new transports.File({ filename: 'logs/error.log', level: 'error' }),
          new transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

module.exports = logger;
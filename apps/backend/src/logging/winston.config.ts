import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import chalk from 'chalk';

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

// Custom format for pretty console output
const customFormat = winston.format.printf(
  ({ level, message, timestamp, context, trace, ...meta }) => {
    const colorizer = winston.format.colorize();
    const levelUpper = level.toUpperCase();
    const contextStr = context ? `[${chalk.cyan(context)}] ` : '';
    const timestampStr = chalk.gray(timestamp);

    let output = `${timestampStr} ${colorizer.colorize(level, `[${levelUpper}]`)} ${contextStr}${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      const metaStr = JSON.stringify(meta, null, 2);
      output += `\n${chalk.gray('Metadata:')} ${chalk.cyan(metaStr)}`;
    }

    // Add stack trace for errors
    if (trace) {
      output += `\n${chalk.red('Stack Trace:')} ${trace}`;
    }

    return output;
  },
);

export function configureWinston() {
  const logDir = path.join(process.cwd(), 'logs');
  winston.addColors(customLevels.colors);

  const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true }),
  );

  const consoleFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    customFormat,
  );

  const fileTransport = new winston.transports.DailyRotateFile({
    dirname: logDir,
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: fileFormat,
  });

  const errorFileTransport = new winston.transports.DailyRotateFile({
    dirname: logDir,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
    format: fileFormat,
  });

  const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
  });

  return {
    levels: customLevels.levels,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
    ),
    transports: [consoleTransport, fileTransport, errorFileTransport],
    exitOnError: false,
  };
}

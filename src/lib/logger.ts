import winston from "winston";
import dotenv from "dotenv";

dotenv.config();
const isProd = process.env.NODE_ENV === "production";
const consoleTransport = new winston.transports.Console({
  handleExceptions: true,
  handleRejections: true,
  format: isProd
    ? winston.format.json()
    : winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: "HH:mm:ss"
      }),
      winston.format.printf(({
        level,
        message,
        timestamp,
        stack,
        service,
        env,
        ...meta
      }) => {
        const metadata =
          meta && Object.keys(meta).length > 0
            ? ` ${JSON.stringify(meta)}`
            : "";

        return `[${timestamp}] ${level}: ${stack || message}${metadata}`;
      }
    )
  )
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  defaultMeta: {
    service: process.env.SERVICE_NAME || "unknown_service",
    env: process.env.NODE_ENV || "development"
  },
  silent: process.env.NODE_ENV === "test",
  exitOnError: false,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({
      stack: true,
      cause: true
    }),
    winston.format.json()
  ),
  transports: [
    consoleTransport
  ]
});

Object.freeze(logger);
export default logger;
import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'debug',
  format: format.printf((info) => {
    return `[${info.level.toUpperCase().padEnd(6)}]-${info.message}`;
  }),
  transports: [new transports.Console()],
});

export default logger;

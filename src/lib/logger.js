const LOG_PREFIX = "[cdre-data]";

function timestamp() {
  return new Date().toISOString();
}

function formatError(error) {
  if (!error) return "Unknown error";
  if (error instanceof Error) {
    return `${error.message}\n${error.stack || ""}`;
  }
  return String(error);
}

export const logger = {
  info(context, message) {
    console.log(`${LOG_PREFIX} ${timestamp()} [INFO] [${context}] ${message}`);
  },

  warn(context, message) {
    console.warn(`${LOG_PREFIX} ${timestamp()} [WARN] [${context}] ${message}`);
  },

  error(context, error) {
    console.error(`${LOG_PREFIX} ${timestamp()} [ERROR] [${context}] ${formatError(error)}`);
  },
};

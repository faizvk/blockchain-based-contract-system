const isProd = process.env.NODE_ENV === "production";

const ts = () => new Date().toISOString();

const logger = {
  info: (...args) => console.log(`[${ts()}] [info]`, ...args),
  warn: (...args) => console.warn(`[${ts()}] [warn]`, ...args),
  error: (...args) => console.error(`[${ts()}] [error]`, ...args),
  debug: (...args) => {
    if (!isProd) console.log(`[${ts()}] [debug]`, ...args);
  },
};

module.exports = logger;

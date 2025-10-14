/**
 * Simple Logger Utility
 * Set DEBUG=true in .env to enable debug logs in production
 */

const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';

const logger = {
  // Debug logs - only shown when DEBUG is enabled
  debug: (...args) => {
    if (DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  // Info logs - important information
  info: (...args) => {
    console.log('[INFO]', ...args);
  },

  // Warning logs
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  // Error logs - always shown
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  // Success logs
  success: (...args) => {
    console.log('[SUCCESS]', ...args);
  }
};

module.exports = logger;

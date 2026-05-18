function logOperation(name, fn) {
  return function (...args) {
    console.log('[' + name + '] START', args);
    try {
      const result = fn(...args);
      console.log('[' + name + '] END', result);
      return result;
    } catch (error) {
      console.error('[' + name + '] ERROR', error);
      throw error;
    }
  };
}

function logger(level, message) {
  console.log('[LOGGER] ' + level.toUpperCase() + ' ' + message);
}

module.exports = {
  logOperation,
  logger,
};

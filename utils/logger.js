import loglevel from 'loglevel';
import _ from 'lodash';
import { AsyncStorage } from "react-native"

const LOG_LEVEL = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT'];

(async () => {
  const defaultLogLevel = AsyncStorage.getItem('logLevel') || 'info';
  // after this, loglevel.getLogger() instance follow this level.
  loglevel.setLevel(defaultLogLevel);
})();

loglevel.setAllLogLevel = async (level) => {
  await AsyncStorage.setItem('logLevel', level);
  _.forOwn(loglevel.getLoggers(), (logger) => {
    if (logger.name === 'webpack-dev-server') {
      return;
    }
    logger.setLevel(level);
  });
};

loglevel.showAllLogLevel = () => {
  const loggerLevels = _.map(loglevel.getLoggers(), (logger) => {
    const level = LOG_LEVEL[logger.getLevel()];
    return `${logger.name}:${level}`;
  });
  return loggerLevels;
};

loglevel.setLogLevel = async (level) => {
  await AsyncStorage.setItem('logLevel', level);
  loglevel.setLevel(level);
};

loglevel.getLogLevel = () => LOG_LEVEL[loglevel.getLevel()];

export default loglevel; // for runtime level change (eg. log.setLevel('info') )
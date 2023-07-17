const os = require('os');

function flatten({ data, prefix = '' } = {}) {
  const _flatten = {};
  function __flatten({ data, prefix = '' } = {}) {
    for (const key in data) {
      if (typeof data[key] !== 'object') _flatten[`${prefix}${key}`] = data[key];
      else __flatten({ data: data[key], prefix: `${prefix}${key}.` });
    }
  }
  __flatten({ data, prefix });
  return _flatten;
}


function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let localIP;

  Object.keys(interfaces).forEach((interfaceName) => {
    const interfaceData = interfaces[interfaceName];
    for (let i = 0; i < interfaceData.length; i++) {
      const { address, family, internal } = interfaceData[i];
      if (family === 'IPv4' && !internal) {
        localIP = address;
        break;
      }
    }
  });

  return localIP;
}

function formatTime(ms) {
  if (ms < 1000) {
    return ms + 'ms';
  } else if (ms < 60 * 1000) {
    const seconds = Math.floor(ms / 1000);
    return seconds + 's';
  } else if (ms < 60 * 60 * 1000) {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return minutes + 'm ' + seconds + 's';
  } else {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return hours + 'h ' + minutes + 'm ' + seconds + 's';
  }
}


module.exports = {
  flatten,
  getLocalIP,
  formatTime,
};

const fs = require('fs-extra');
const path = require('path');

console.log(readdir(path.resolve(__dirname, 'lib'), {}));

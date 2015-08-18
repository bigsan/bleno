declare var require;
import os = require('os');

var bindings = null;

var platform = os.platform();

if (platform === 'darwin') {
  bindings = require('./mac/bindings');
} else if (platform === 'linux' || platform === 'win32') {
  bindings = require('./hci-socket/bindings');
} else {
  throw new Error('Unsupported platform');
}

export = bindings;
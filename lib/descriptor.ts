import debug = require('debug');
debug('descriptor');

import UuidUtil = require('./uuid-util');

export = Descriptor;

class Descriptor {
  uuid: string;
  value: Buffer;

  constructor(options) {
    this.uuid = UuidUtil.removeDashes(options.uuid);
    this.value = options.value || new Buffer(0);
  }

  toString() {
    return JSON.stringify({
      uuid: this.uuid,
      value: Buffer.isBuffer(this.value) ? this.value.toString('hex') : this.value
    });
  }
}

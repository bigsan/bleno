import events = require('events');
import util = require('util');

import debug = require('debug');
debug('primary-service');

import UuidUtil = require('./uuid-util');

export = PrimaryService;

class PrimaryService extends events.EventEmitter {
  uuid: string;
  characteristics: any[];

  constructor(options) {
    super();
    this.uuid = UuidUtil.removeDashes(options.uuid);
    this.characteristics = options.characteristics || [];
  }

  toString() {
    return JSON.stringify({
      uuid: this.uuid,
      characteristics: this.characteristics
    });
  }
}

import events = require('events');
import util = require('util');

import debug = require('debug');
debug('characteristic');

import UuidUtil = require('./uuid-util');

export = Characteristic;

class Characteristic extends events.EventEmitter {
  uuid: string;
  properties: any[];
  secure: any[];
  value: any;
  descriptors: any[];

  maxValueSize: any;
  updateValueCallback: any;

  RESULT_SUCCESS = 0x00;
  RESULT_INVALID_OFFSET = 0x07;
  RESULT_ATTR_NOT_LONG = 0x0b;
  RESULT_INVALID_ATTRIBUTE_LENGTH = 0x0d;
  RESULT_UNLIKELY_ERROR = 0x0e;

  onReadRequest(offset, callback) {
    callback(this.RESULT_UNLIKELY_ERROR, null);
  }
  onWriteRequest(data, offset, withoutResponse, callback) {
    callback(this.RESULT_UNLIKELY_ERROR);
  }
  onSubscribe(maxValueSize, updateValueCallback) {
    this.maxValueSize = maxValueSize;
    this.updateValueCallback = updateValueCallback;
  }
  onUnsubscribe() {
    this.maxValueSize = null;
    this.updateValueCallback = null;
  }
  onNotify() { }
  onIndicate() { }

  constructor(options) {
    super();

    this.uuid = UuidUtil.removeDashes(options.uuid);
    this.properties = options.properties || [];
    this.secure = options.secure || [];
    this.value = options.value || null;
    this.descriptors = options.descriptors || [];

    if (options.onReadRequest) {
      this.onReadRequest = options.onReadRequest;
    }

    if (options.onWriteRequest) {
      this.onWriteRequest = options.onWriteRequest;
    }

    if (options.onSubscribe) {
      this.onSubscribe = options.onSubscribe;
    }

    if (options.onUnsubscribe) {
      this.onUnsubscribe = options.onUnsubscribe;
    }

    if (options.onNotify) {
      this.onNotify = options.onNotify;
    }

    if (options.onIndicate) {
      this.onIndicate = options.onIndicate;
    }

    this.on('readRequest', this.onReadRequest.bind(this));
    this.on('writeRequest', this.onWriteRequest.bind(this));
    this.on('subscribe', this.onSubscribe.bind(this));
    this.on('unsubscribe', this.onUnsubscribe.bind(this));
    this.on('notify', this.onNotify.bind(this));
    this.on('indicate', this.onIndicate.bind(this));
  }

  toString() {
    return JSON.stringify({
      uuid: this.uuid,
      properties: this.properties,
      secure: this.secure,
      value: this.value,
      descriptors: this.descriptors
    });
  }
}

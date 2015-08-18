import Debug = require('debug');
var debug = Debug('bleno');

import events = require('events');
import os = require('os');
import util = require('util');

import UuidUtil = require('./uuid-util');

import PrimaryService = require('./primary-service');
import Characteristic = require('./characteristic');
import Descriptor = require('./descriptor');

import bindings = require('./bindings');

var platform = os.platform();

export = Bleno;

class Bleno extends events.EventEmitter {
  state = 'unknown';
  address = 'unknown';
  rssi = 0;
  mtu = 20;

  PrimaryService = PrimaryService;
  Characteristic = Characteristic;
  Descriptor = Descriptor;

  _bindings = bindings;

  constructor() {
    super();

    this._bindings.on('stateChange', this.onStateChange.bind(this));
    this._bindings.on('addressChange', this.onAddressChange.bind(this));
    this._bindings.on('advertisingStart', this.onAdvertisingStart.bind(this));
    this._bindings.on('advertisingStop', this.onAdvertisingStop.bind(this));
    this._bindings.on('servicesSet', this.onServicesSet.bind(this));
    this._bindings.on('accept', this.onAccept.bind(this));
    this._bindings.on('mtuChange', this.onMtuChange.bind(this));
    this._bindings.on('disconnect', this.onDisconnect.bind(this));

    this._bindings.on('rssiUpdate', this.onRssiUpdate.bind(this));
  }

  onStateChange(state) {
    debug('stateChange ' + state);

    this.state = state;

    this.emit('stateChange', state);
  }

  onAddressChange(address) {
    debug('addressChange ' + address);

    this.address = address;
  }

  onAdvertisingStart(error) {
    debug('advertisingStart: ' + error);

    if (error) {
      this.emit('advertisingStartError', error);
    }

    this.emit('advertisingStart', error);
  }

  onAdvertisingStop() {
    debug('advertisingStop');
    this.emit('advertisingStop');
  }

  onServicesSet(error) {
    debug('servicesSet');

    if (error) {
      this.emit('servicesSetError', error);
    }

    this.emit('servicesSet', error);
  }

  onAccept(clientAddress) {
    debug('accept ' + clientAddress);
    this.emit('accept', clientAddress);
  }

  onMtuChange(mtu) {
    debug('mtu ' + mtu);

    this.mtu = mtu;

    this.emit('mtuChange', mtu);
  }

  onDisconnect(clientAddress) {
    debug('disconnect' + clientAddress);
    this.emit('disconnect', clientAddress);
  }

  onRssiUpdate(rssi) {
    this.emit('rssiUpdate', rssi);
  }

  startAdvertising(name, serviceUuids, callback) {
    if (callback) {
      this.once('advertisingStart', callback);
    }

    var undashedServiceUuids = [];

    if (serviceUuids && serviceUuids.length) {
      for (var i = 0; i < serviceUuids.length; i++) {
        undashedServiceUuids[i] = UuidUtil.removeDashes(serviceUuids[i]);
      }
    }

    this._bindings.startAdvertising(name, undashedServiceUuids);
  }

  startAdvertisingIBeacon(uuid, major, minor, measuredPower, callback) {
    var undashedUuid = UuidUtil.removeDashes(uuid);
    var uuidData = new Buffer(undashedUuid, 'hex');
    var uuidDataLength = uuidData.length;
    var iBeaconData = new Buffer(uuidData.length + 5);

    for (var i = 0; i < uuidDataLength; i++) {
      iBeaconData[i] = uuidData[i];
    }

    iBeaconData.writeUInt16BE(major, uuidDataLength);
    iBeaconData.writeUInt16BE(minor, uuidDataLength + 2);
    iBeaconData.writeInt8(measuredPower, uuidDataLength + 4);

    if (callback) {
      this.once('advertisingStart', callback);
    }

    debug('iBeacon data = ' + iBeaconData.toString('hex'));

    this._bindings.startAdvertisingIBeacon(iBeaconData);
  }

  startAdvertisingWithEIRData(advertisementData, scanData?, callback?) {
    if (platform === 'linux') {
      // Linux only API
      if (callback) {
        this.once('advertisingStart', callback);
      }
      this._bindings.startAdvertisingWithEIRData(advertisementData, scanData);
    }
    else if (platform === 'darwin' && parseFloat(os.release()) >= 14) {
      // OS X >= 10.10 API
      if (callback) {
        this.once('advertisingStart', callback);
      }
      this._bindings.startAdvertisingWithEIRData(advertisementData);
    }
  }

  disconnect() {
    if (platform === 'linux') {
      // Linux only API
      debug('disconnect');
      this._bindings.disconnect();
    }
  }

  stopAdvertising(callback?) {
    if (callback) {
      this.once('advertisingStop', callback);
    }
    this._bindings.stopAdvertising();
  }

  setServices(services, callback?) {
    if (callback) {
      this.once('servicesSet', callback);
    }
    this._bindings.setServices(services);
  }

  updateRssi(callback) {
    if (callback) {
      this.once('rssiUpdate', function(rssi) {
        callback(null, rssi);
      });
    }

    this._bindings.updateRssi();
  }
}

'use strict';

var leveldown = require('leveldown');
var levelup = require('levelup');
var Q = require('q');
var ttl = require('level-ttl');

function _noop() { /** noop */ }

/**
 * Create a hangar instance
 *
 * options:
 * - location - The location of the backing datastore
 * - [ttl] - The time-to-live for cache entries. default: 4 hours
 * - [checkFrequency] - The frequency to check TTL values. default: 5 minutes
 * - [keyEncoding] - The encoding to use for the keys. default: utf8 (string)
 * - [valueEncoding] - The encoding to use for the values. default: json
 *
 * @constructor
 * @param {Object} options - A set of options to use in the cache
 */
function Hangar(options) {
  this.options = options || {};
  if (typeof options.location !== 'string') {
    throw new Error('Must provide a valid location');
  }
  this.options.ttl = {
    // default ttl to 4 hours
    ttl: options.ttl || 1000 * 60 * 60 * 4
  };
  if (typeof options.checkFrequency !== 'number') {
    // default frequency check to 5 minutes
    this.options.checkFrequency = 1000 * 60 * 5;
  }
  // default keys to utf8 string encoding
  this.options.keyEncoding = options.keyEncoding || 'utf8';
  // default values to json encoding
  this.options.valueEncoding = options.valueEncoding || 'json';
}

/**
 * Start and open a connection to the cache
 *
 * @param {Function} [callback] - The callback will receive an error as the first parameter if the cache cannot be started
 */
Hangar.prototype.start = function (callback) {
  callback = callback || _noop;
  var self = this;
  try {
    self.db = ttl(levelup(self.options.location, self.options), {
      checkFrequency: self.options.checkFrequency
    });
  } catch (err) {
    return callback(err);
  }
  return callback();
};

/**
 * Stop and close the connection to the cache
 *
 * @param {Function} [callback] - The callback will receive an error as the first parameter if the cache cannot be started
 */
Hangar.prototype.stop = function (callback) {
  callback = callback || _noop;
  this.db.close(callback);
};

/**
 * Stop, close, and destroy the cache contents
 *
 * @param {Function} [callback] - The callback will receive an error as the first parameter if the cache cannot be started
 */
Hangar.prototype.drop = function (callback) {
  callback = callback || _noop;
  var self = this;
  self.stop(function (err) {
    if (err) {
      return callback(err);
    }
    leveldown.destroy(self.options.location, callback);
  });
};

/**
 * Retrieve an entry from the cache
 *
 * @param {String} key - The key to lookup
 * @param {Function} [callback] - The callback will receive an error as the first parameter if value cannot be found, or the value as the second paramater if it was found
 */
Hangar.prototype.get = function (key, callback) {
  callback = callback || _noop;
  this.db.get(key, callback);
};

function _pget(thisArg) {
  var args = [].slice.call(arguments, 1);
  return Q.nbind(thisArg.get, thisArg).apply(thisArg, args);
}

/**
 * Retrieve entries from the cache. Order of key index will be maintained.
 *
 * @param {Array} keys - The keys to lookup
 * @param {Function} [callback] - The callback will receive an error as the first parameter if all of the values cannot be found, or all of the values as the second paramater if they were found
 */
Hangar.prototype.getMany = function (keys, callback) {
  callback = callback || _noop;
  var values = [];

  for (var i = 0, l = keys.length; i < l; i++) {
    values.push(_pget(this, keys[i]));
  }
  return Q.all(values).nodeify(callback);
};


/**
 * Set an entry in the cache
 *
 * @param {String} key - The key to set
 * @param {Object} value - The value to set
 * @param {Function} [callback] - The callback will receive an error as the first parameter if the key cannot be set
 */
Hangar.prototype.set = function (key, value, callback) {
  callback = callback || _noop;
  this.db.put(key, value, this.options.ttl, callback);
};

/**
 * Set multiple entries in the cache. Order of key and value index will be maintained.
 *
 * Example:
 * h.setMany(['k1', 'k2'], ['v1', 'v2'], function (err) {
 *   h.getMany(['k1', 'k2'], function (values) {
 *     console.log(values); //=> ['v1', 'v2']
 *   });
 * });
 *
 * @param {String} key - The keys to set
 * @param {Object} value - The values to set
 * @param {Function} [callback] - The callback will receive an error as the first parameter if all of the keys cannot be set
 */
Hangar.prototype.setMany = function (keys, values, callback) {
  callback = callback || _noop;
  var ops = [];

  for (var i = 0, l = keys.length; i < l; i++) {
    ops.push({
      type: 'put',
      key: keys[i],
      value: values[i]
    });
  }
  this.db.batch(ops, this.options.ttl, callback);
};

/**
 * Remove an entry from the cache
 *
 * @param {String} key - The key of the entry to remove
 * @param {Function} [callback] - The callback will receive an error as the first parameter if all of the keys cannot be removed
 *
 */
Hangar.prototype.del = function (key, callback) {
  callback = callback || _noop;
  this.db.del(key, callback);
};

/**
 * Remove multiple entries from the cache
 *
 * @param {Array} keys - The keys of the entries to remove
 * @param {Function} [callback] - The callback will receive an error as the first parameter if all of the keys cannot be removed
 */
Hangar.prototype.delMany = function (keys, callback) {
  callback = callback || _noop;
  var ops = [];

  for (var i = 0, l = keys.length; i < l; i++) {
    ops.push({
      type: 'del',
      key: keys[i]
    });
  }
  this.db.batch(ops, callback);
};

module.exports = Hangar;

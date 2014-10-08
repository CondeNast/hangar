'use strict';

var leveldown = require('leveldown');
var levelup = require('levelup');
var ttl = require('level-ttl');

var Promise = require('bluebird');

function _noop() { /* noop */ }

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
    throw new Error('Must provide a valid cache location');
  }
  this.options.ttl = {
    // default ttl to 4 hours
    ttl: options.ttl || 1000 * 60 * 60 * 4
  };
  if (typeof options.checkFrequency !== 'number') {
    // default frequency check to 5 minutes
    this.options.checkFrequency = 1000 * 60 * 5;
  }
  // default size of in-memory LRU cache (in bytes) to 8MB
  this.options.cacheSize = options.cacheSize || 8 * 1024 * 1024;
  // default keys to utf8 string encoding
  this.options.keyEncoding = options.keyEncoding || 'utf8';
  // default values to json encoding
  this.options.valueEncoding = options.valueEncoding || 'json';
}

/**
 * Start and open a connection to the cache
 *
 * @param {Function} [callback]
 */
Hangar.prototype.start = function(callback) {
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
 * @param {Function} [callback]
 */
Hangar.prototype.stop = function(callback) {
  callback = callback || _noop;
  this.db.close(callback);
};

/**
 * Stop, close, and destroy the cache contents
 *
 * @param {Function} [callback]
 */
Hangar.prototype.drop = function(callback) {
  callback = callback || _noop;
  var self = this;
  self.stop(function(err) {
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
 * @param {Function} [callback]
 */
Hangar.prototype.get = function(key, callback) {
  callback = callback || _noop;
  this.db.get(key, callback);
};

/**
 * Eventually retrieve an entry from the cache
 *
 * Example:
 * _pget(this, 'k1').then(callback);
 *
 * @param {Object} thisArg - The object to use as this
 * @param {String} key - The key to lookup
 * @api private
 */
function _pget(thisArg, key) {
  return new Promise(function(resolve, reject) {
    thisArg.get(key, function(err, value) {
      if (err) {
        return reject(err);
      }
      return resolve(value);
    });
  });
}

/**
 * Internal promise-to-callback error handler
 *
 * @private
 */
function _perror(callback) {
  return function(err) {
    callback(err);
  };
}

/**
 * Internal promise-to-callback success handler
 *
 * @private
 */
function _psuccess(callback) {
  return function(values) {
    callback(null, values);
  };
}

/**
 * Retrieve entries from the cache. Order of keys will be maintained.
 *
 * @param {Array} keys - The keys to lookup
 * @param {Function} [callback]
 */
Hangar.prototype.getMany = function(keys, callback) {
  callback = callback || _noop;
  var tasks = [];

  for (var i = 0, l = keys.length; i < l; i++) {
    tasks.push(_pget(this, keys[i]));
  }
  return Promise.all(tasks).then(_psuccess(callback), _perror(callback));
};


/**
 * Internal handler for a callback error or value
 *
 * @private
 */
function _errorOr(value, callback) {
  return function(err) {
    if (err) {
      return callback(err);
    }
    return callback(null, value);
  };
}

/**
 * Set an entry in the cache
 *
 * @param {String} key - The key to set
 * @param {Object} value - The value to set
 * @param {Function} [callback]
 */
Hangar.prototype.set = function(key, value, callback) {
  callback = callback || _noop;
  this.db.put(key, value, this.options.ttl, _errorOr(value, callback));
};

/**
 * Set multiple entries in the cache. Order of keys/values will be maintained.
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
 * @param {Function} [callback]
 */
Hangar.prototype.setMany = function(keys, values, callback) {
  callback = callback || _noop;
  var ops = [];

  for (var i = 0, l = keys.length; i < l; i++) {
    ops.push({
      type: 'put',
      key: keys[i],
      value: values[i]
    });
  }
  this.db.batch(ops, this.options.ttl, _errorOr(values, callback));
};

/**
 * Populate the cache with properties and values of an object literal
 *
 * Example:
 * var multi = { 'k1': 'v1', 'k2': 'v2' }
 *
 * h.setObject(multi, function (err) {
 *   h.getMany(['k1', 'k2'], function (values) {
 *     console.log(values); //=> ['v1', 'v2']
 *   });
 * });
 *
 * @param {Object} obj - The keys/values to set in object literal form
 * @param {Function} [callback]
 */
Hangar.prototype.setObject = function(obj, callback) {
  callback = callback || _noop;
  var ops = [];
  var values = [];

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = values.push(obj[key]);
      ops.push({
        type: 'put',
        key: key,
        value: value
      });
    }
  }

  this.db.batch(ops, this.options.ttl, _errorOr(values, callback));
};

/**
 * Remove an entry from the cache
 *
 * @param {String} key - The key of the entry to remove
 * @param {Function} [callback]
 *
 */
Hangar.prototype.del = function(key, callback) {
  callback = callback || _noop;
  this.db.del(key, callback);
};

/**
 * Remove multiple entries from the cache
 *
 * @param {Array} keys - The keys of the entries to remove
 * @param {Function} [callback]
 */
Hangar.prototype.delMany = function(keys, callback) {
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

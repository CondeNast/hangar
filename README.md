# hangar

A lightweight Node.js application cache powered by LevelDB.

[![Build Status](https://secure.travis-ci.org/CondeNast/hangar.png?branch=master)](http://travis-ci.org/CondeNast/hangar)
[![Code Climate](https://codeclimate.com/github/CondeNast/hangar/badges/gpa.svg)](https://codeclimate.com/github/CondeNast/hangar)


## Install

[![NPM](https://nodei.co/npm/hangar.png?compact=true)](https://nodei.co/npm/hangar/)

## Usage

```javascript
var Hangar = require('hangar');
var cache = new Hangar({ location: './cache' });

cache.start(function(err) {
  if (err) console.error(err);
});

cache.set('foo', { k: 'v' }, function(err) {
  if (err) console.error(err);
  cache.get('foo', function(err, value) {
    console.log(value);
  });
});
```

## API

  * <a href="#hangar_start"><code><b>hangar.start()</b></code></a>
  * <a href="#hangar_stop"><code><b>hangar.stop()</b></code></a>
  * <a href="#hangar_drop"><code><b>hangar.drop()</b></code></a>
  * <a href="#hangar_get"><code><b>hangar.get()</b></code></a>
  * <a href="#hangar_getMany"><code><b>hangar.getMany()</b></code></a>
  * <a href="#hangar_set"><code><b>hangar.set()</b></code></a>
  * <a href="#hangar_setMany"><code><b>hangar.setMany()</b></code></a>
  * <a href="#hangar_setObject"><code><b>hangar.setObject()</b></code></a>
  * <a href="#hangar_del"><code><b>hangar.del()</b></code></a>
  * <a href="#hangar_delMany"><code><b>hangar.delMany()</b></code></a>

---
### Hangar(options)
Create a hangar instance

Example:

```javascript
var Hangar = require('hangar');
var cache = new Hangar(options);
```
**options:**

- location - The location for the backing datastore. note: location is required
- [ttl] - The time-to-live for cache entries. default: 4 hours
- [checkFrequency] - The frequency to check TTL values. default: 5 minutes
- [cacheSize] - The size of the in-memory LRU cache: default: 8MB
- [keyEncoding] - The encoding to use for the keys. default: utf8 (string)
- [valueEncoding] - The encoding to use for the values. default: json

**Parameters**

**[options]** *Object* - A set of options to use in the cache


---
<a name="hangar_start"></a>
### start(\[callback\])
Start and open a connection to the cache. Note, `start()` is an asynchronous operation. Whether you provide an error-handling callback or not, all read/write operations will be queued until the backing datastore is fully opened.

Example:

```javascript
cache.start(function(err) {
  console.error(err);
});
```

**Parameters**

**[callback]** *Function* - The callback will receive an error as the first parameter if the cache cannot be started


---
<a name="hangar_stop"></a>
### stop(\[callback\])
Stop and close the connection to the cache

Example:

```javascript
cache.stop(function(err) {
  console.error(err);
});
```

**Parameters**

**[callback]** *Function* - The callback will receive an error as the first parameter if the cache cannot be started


---
<a name="hangar_drop"></a>
### drop(\[callback\])
Stop, close, and destroy the cache contents

Example:

```javascript
cache.drop(function(err) {
  console.error(err);
});
```

**Parameters**

**[callback]** *Function* - The callback will receive an error as the first parameter if the cache cannot be started


---
<a name="hangar_get"></a>
### get(key, \[callback\])
Retrieve an entry from the cache

Example:

```javascript
cache.get('foo', function(err, value) {
  if (err) {
    console.error(err);
  }
  console.log(value);
});
```

**Parameters**

**key** *String* - The key to lookup

**[callback]** *Function* - The callback will receive an error as the first parameter if value cannot be found, or the value as the second paramater if it was found


---
<a name="hangar_getMany"></a>
### getMany(keys, \[callback\])
Retrieve entries from the cache. Order of key index will be maintained.

Example:

```javascript
cache.get(['foo', 'bar'], function(err, values) {
  if (err) {
    console.error(err);
  }
  console.log(values);
});
```

**Parameters**

**keys** *Array* - The keys to lookup

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the values cannot be found, or all of the values as the second paramater if they were found


---
<a name="hangar_set"></a>
### set(key, value, \[callback\])
Set an entry in the cache

Example:

```javascript
cache.set('foo', 'bar', function(err) {
  if (err) {
    console.error(err);
  }
});
```

**Parameters**

**key** *String* - The key to set

**value** *Object* - The value to set

**[callback]** *Function* - The callback will receive an error as the first parameter if the key cannot be set or the value that was set as the second parameter (function((null, value) {...})


---
<a name="hangar_setMany"></a>
### setMany(key, value, \[callback\])
Set multiple entries in the cache. Order of key and value index will be maintained.

Example:

```javascript
cache.setMany(['k1', 'k2'], ['v1', 'v2'], function(err) {
  cache.getMany(['k1', 'k2'], function(values) {
    console.log(values); //=> ['v1', 'v2']
  });
});
```

**Parameters**

**key** *Array* - The keys to set

**value** *Array* - The values to set

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the keys cannot be set or the values that were set as the second parameter (function((null, values) {...})



---
<a name="hangar_setObject"></a>
### setObject(obj, \[callback\])
Populate the cache with properties of an object literal

Example:

```javascript
var multi = { 'k1': 'v1', 'k2': 'v2' }

cache.setObject(multi, function(err) {
  cache.getMany(['k1', 'k2'], function(values) {
    console.log(values); //=> ['v1', 'v2']
  });
});
```

**Parameters**

**obj** *Object* - The key/values to set in object literal form

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the keys cannot be set or the object values that were set as the second parameter (function((null, object.values) {...})



---
<a name="hangar_del"></a>
### del(key, \[callback\])
Remove an entry from the cache

Example:

```javascript
cache.del('foo', function(err) {
  if (err) {
    console.error(err);
  }
});
```

**Parameters**

**key** *String* - The key of the entry to remove

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the keys cannot be removed


---
<a name="hangar_delMany"></a>
### delMany(keys, \[callback\])
Remove multiple entries from the cache

Example:

```javascript
cache.delMany(['foo', 'bar'], function(err) {
  if (err) {
    console.error(err);
  }
});
```

**Parameters**

**keys** *Array* - The keys of the entries to remove

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the keys cannot be removed


---
## Tests

Linting is done through [jshint](https://npmjs.org/package/jshint) with settings from `./.jshintrc`. This happens automatically as part of the pretest script when running tests.

Tests are written with [tape](https://npmjs.org/package/tape) and can be run through the npm test script.

    $ npm test

## License

MIT

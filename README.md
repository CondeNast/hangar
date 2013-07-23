# hangar

A lightweight Node.js application cache powered by LevelDB.

[![Build Status](https://secure.travis-ci.org/CondeNast/hangar.png?branch=master)](http://travis-ci.org/CondeNast/hangar)

[![NPM](https://nodei.co/npm/hangar.png?compact=true)](https://nodei.co/npm/hangar/)

## Install

    npm install hangar --save

## Usage

```javascript
var Hangar = require('hangar');
var h = new Hangar({ location: './db' });

h.start(function (err) {
  if (err) console.error(err);
});

h.set('foo', { k: 'v' }, function (err) {
  if (err) console.error(err);
  h.get('foo', function (err, value) {
    console.log(value);
  });
});

h.stop(function (err) {
  if (err) console.error(err);
});
```

## API

### Hangar(options)
Create a hangar instance

Example:

```javascript
var Hangar = require('hangar');
var h = new Hangar(options);
```
**options:**

- location - The location for the backing datastore. note: location is required
- [ttl] - The time-to-live for cache entries. default: 4 hours
- [checkFrequency] - The frequency to check TTL values. default: 5 minutes
- [keyEncoding] - The encoding to use for the keys. default: utf8 (string)
- [valueEncoding] - The encoding to use for the values. default: json

**Parameters**

**[options]** *Object* - A set of options to use in the cache


### start(\[callback\])
Start and open a connection to the cache. Note, `start()` is an asynchronous operation. Whether you provide an error-handling callback or not, all read/write operations will be queued until the backing datastore is fully opened.

Example:

```javascript
h.start(function (err) {
  console.error(err);
});
```

**Parameters**

**[callback]** *Function* - The callback will receive an error as the first parameter if the cache cannot be started


### stop(\[callback\])
Stop and close the connection to the cache

Example:

```javascript
h.stop(function (err) {
  console.error(err);
});
```

**Parameters**

**[callback]** *Function* - The callback will receive an error as the first parameter if the cache cannot be started


### drop(\[callback\])
Stop, close, and destroy the cache contents

Example:

```javascript
h.drop(function (err) {
  console.error(err);
});
```

**Parameters**

**[callback]** *Function* - The callback will receive an error as the first parameter if the cache cannot be started


### get(key, \[callback\])
Retrieve an entry from the cache

Example:

```javascript
h.get('foo', function (err, value) {
  if (err) {
    console.error(err);
  }
  console.log(value);
});
```

**Parameters**

**key** *String* - The key to lookup

**[callback]** *Function* - The callback will receive an error as the first parameter if value cannot be found, or the value as the second paramater if it was found


### getMany(keys, \[callback\])
Retrieve entries from the cache. Order of key index will be maintained.

Example:

```javascript
h.get(['foo', 'bar'], function (err, values) {
  if (err) {
    console.error(err);
  }
  console.log(values);
});
```

**Parameters**

**keys** *Array* - The keys to lookup

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the values cannot be found, or all of the values as the second paramater if they were found


### set(key, value, \[callback\])
Set an entry in the cache

Example:

```javascript
h.set('foo', 'bar', function (err) {
  if (err) {
    console.error(err);
  }
});
```

**Parameters**

**key** *String* - The key to set

**value** *Object* - The value to set

**[callback]** *Function* - The callback will receive an error as the first parameter if the key cannot be set


### setMany(key, value, \[callback\])
Set multiple entries in the cache. Order of key and value index will be maintained.

Example:

```javascript
h.setMany(['k1', 'k2'], ['v1', 'v2'], function (err) {
  h.getMany(['k1', 'k2'], function (values) {
    console.log(values); //=> ['v1', 'v2']
  });
});
```

**Parameters**

**key** *String* - The keys to set

**value** *Object* - The values to set

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the keys cannot be set


### del(key, \[callback\])
Remove an entry from the cache

Example:

```javascript
h.del('foo', function (err) {
  if (err) {
    console.error(err);
  }
});
```

**Parameters**

**key** *String* - The key of the entry to remove

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the keys cannot be removed


### delMany(keys, \[callback\])
Remove multiple entries from the cache

Example:

```javascript
h.delMany(['foo', 'bar'], function (err) {
  if (err) {
    console.error(err);
  }
});
```

**Parameters**

**keys** *Array* - The keys of the entries to remove

**[callback]** *Function* - The callback will receive an error as the first parameter if all of the keys cannot be removed

## Tests

Linting is done through [jshint](https://npmjs.org/package/jshint) with settings from `./.jshintrc`. This happens automatically as part of the pretest script when running tests.

Tests are written with [tape](https://npmjs.org/package/tape) and can be run through the npm test script.

    $ npm test

## License

MIT

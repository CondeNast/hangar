'use strict';

var Hangar = require('../lib/hangar');
var test = require('tape');

var _options = function (now) {
  var rand = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
  return {
    location: './hangar-test-db-' + rand + Date.now()
  };
};

test('Start/Stop/Drop hangar', function (t) {
  t.plan(3);

  var hangar = new Hangar(_options(Date.now()));
  hangar.start(function (err) {
    t.notOk(err, '#start() should not have errors');
    hangar.stop(function (err) {
      t.notOk(err, '#stop() should not have errors');
      hangar.drop(function (err) {
        t.notOk(err, '#drop() should not have errors');
      });
    });
  });
});

test('Get notfound value from hangar', function (t) {
  t.plan(4);

  var hangar = new Hangar(_options(Date.now()));
  hangar.start(function (err) {
    hangar.get('k1', function (err, value) {
      t.ok(err, 'err should exist when using a notfound key');
      t.equal(typeof err, 'object', 'err should be an object');
      t.equal(err instanceof Error, true, 'err should be an instance of Error');
      t.notOk(value, 'value should not exist');
      hangar.drop();
    });
  });
});

test('Set/Get value from hangar', function (t) {
  t.plan(3);

  var obj = {
    key: 'k1',
    value: 'v1'
  };

  var hangar = new Hangar(_options(Date.now()));
  hangar.start(function (err) {
    hangar.set(obj.key, obj.value, function (err) {
      t.notOk(err, '#set() should not have errors');
      hangar.get(obj.key, function (err, value) {
        t.notOk(err, '#get() should not have errors');
        t.equal(obj.value, value, 'value should equal initial value');
        hangar.drop();
      });
    });
  });
});

test('Set/Delete/Get value from hangar', function (t) {
  t.plan(3);

  var obj = {
    key: 'k1',
    value: 'v1'
  };

  var hangar = new Hangar(_options(Date.now()));
  hangar.start(function (err) {
    hangar.set(obj.key, obj.value, function (err) {
      hangar.del(obj.key, function (err) {
        t.notOk(err, '#del() should not have errors');
        hangar.get(obj.key, function (err, value) {
          t.ok(err, 'err should exist when using a notfound key');
          t.notOk(value, 'value should not exist');
          hangar.drop();
        });
      });
    });
  });
});

test('Set/Get many values from hangar', function (t) {
  t.plan(3);

  var obj = {
    keys: [
      'k1',
      'k2',
      'k3'],
    values: [
      'v1',
      'v2',
      'v3']
  };

  var hangar = new Hangar(_options(Date.now()));
  hangar.start(function (err) {
    hangar.setMany(obj.keys, obj.values, function (err) {
      t.notOk(err, '#setMany() should not have errors');
      hangar.getMany(obj.keys, function (err, values) {
        t.notOk(err, '#getMany() should not have errors');
        t.equal(obj.values.length, values.length, 'lengths should be equal');
        hangar.drop();
      });
    });
  });
});

test('Set/Get object value from hangar', function (t) {
  t.plan(3);

  var obj = {
      'k1': 'v1',
      'k2': 'v2',
      'k3': 'v3',
  };

  var keys = ['k1', 'k2', 'k3'];

  var hangar = new Hangar(_options(Date.now()));
  hangar.start(function (err) {
    hangar.setObject(obj, function (err) {
      t.notOk(err, '#setObject() should not have errors');
      hangar.getMany(keys, function (err, values) {
        t.notOk(err, '#getMany() should not have errors');
        t.equal(keys.length, values.length, 'lengths should be equal');
        hangar.drop();
      });
    });
  });
});


test('Set/Delete/Get many values from hangar', function (t) {
  t.plan(3);

  var obj = {
    keys: [
      'k1',
      'k2',
      'k3'],
    values: [
      'v1',
      'v2',
      'v3']
  };

  var hangar = new Hangar(_options(Date.now()));
  hangar.start(function (err) {
    hangar.setMany(obj.keys, obj.values, function (err) {
      hangar.delMany(obj.keys, function (err) {
        t.notOk(err, '#delMany() should not have errors');
        hangar.getMany(obj.keys, function (err, values) {
          t.ok(err, 'err should exist when using a notfound key');
          t.notOk(values, 'value should not exist');
          hangar.drop();
        });
      });
    });
  });
});

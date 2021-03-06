var test = require('tape');
var quickconnect = require('..');
var connections = [];
var dcs = [];
var room = require('uuid').v4();

test('create connector 0', function(t) {
  t.plan(3);
  t.ok(connections[0] = quickconnect(location.origin, { room: room }), 'created');
  t.equal(typeof connections[0].createDataChannel, 'function', 'has a createDataChannel function');

  // create the data channel
  connections[0].createDataChannel('test');
  t.pass('dc created');
});

test('create connector 1', function(t) {
  t.plan(3);
  t.ok(connections[1] = quickconnect(location.origin, { room: room }), 'created');
  t.equal(typeof connections[1].createDataChannel, 'function', 'has a createDataChannel function');

  // create the data channel
  connections[1].createDataChannel('test');
  t.pass('dc created');
});

test('data channels opened', function(t) {
  t.plan(2);

  connections[0].once('test:open', function(dc) {
    dcs[0] = dc;
    t.equal(dc.readyState, 'open', 'connection test dc 0 open');
  });

  connections[1].once('test:open', function(dc) {
    dcs[1] = dc;
    t.equal(dc.readyState, 'open', 'connection test dc 0 open');
  });
});

test('check that we are receiving heartbeats from both connections', function(t) {
  t.plan(2);

  connections[0].once('hb:' + connections[1].id, function() {
    t.pass('connection:0 received heartbeat from connection:1');
  });

  connections[1].once('hb:' + connections[0].id, function() {
    t.pass('connection:1 received heartbeat from connection:0');
  });

  setTimeout(function() {
    t.fail('Timed out waiting for heartbeats');
    t.end();
  }, 10000);
});

test('close connection 0', function(t) {
  t.plan(1);
  connections[0].close();
  t.pass('connection closed');
});

test('connections both trigger received peer:disconnect events', function(t) {
  t.plan(4);
  connections[0].once('peer:disconnect', function(id) {
    t.equal(id, connections[1].id, 'got peer:disconnect event for connection:1');
  });

  connections[0].once('test:close', t.pass.bind(t, 'connection:0 data channel close event fired'));

  connections[1].once('peer:disconnect', function(id) {
    t.equal(id, connections[0].id, 'got peer:disconnect event for connection:0');
  });

  connections[1].once('test:close', t.pass.bind(t, 'connection:1 data channel close event fired'));

  setTimeout(function() {
    t.fail('timed out waiting for peer:disconnect');
    t.end();
  }, 10000);
});
var assert = require('assert');
var path = require('path');
var async = require('async');
var yexec = require('..');

describe('yexec', function() {
  it('error for missing command', function(done) {
    yexec({executable: 'missing_cmd', args: []}, function(err) {
      assert.ok(err);
      done();
    });
  });

  it('error with non-zero exit code', function(done) {
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/fail.js')]
    };
    yexec(params, function(err) {
      assert.equal(err.code, 1);
      done();
    });
  });

  it('captures stdout and stderr', function(done) {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/success.js')],
      logger: log
    };
    yexec(params, function(err) {
      if (err) return done(err);
      assert.equal(log._info.length, 1);
      assert.equal('stdout message', log._info[0]);
      assert.equal(log._warn.length, 1);
      assert.equal('stderr message', log._warn[0]);
      done();
    });
  });

  it('filters log events passing in array of patterns', function(done) {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/success.js')],
      logger: log,
      logFilter: [/stdout/]
    };
    yexec(params, function(err) {
      if (err) return done(err);
      assert.equal(log._info.length, 0);
      assert.equal(log._warn.length, 1);
      done();
    });
  });

  it('filters logging with function', function(done) {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/success.js')],
      logger: log,
      logFilter: function(level, msg) {
        return level !== 'info';
      }
    };
    yexec(params, function(err) {
      if (err) return done(err);
      assert.equal(log._info.length, 0);
      assert.equal(log._warn.length, 1);
      done();
    });
  });

  it('kills process if not finished within timeout period', function(done) {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/100ms.js')],
      logger: log,
      timeout: 20
    };
    yexec(params, function(err) {
      assert.equal(err.code, 'TIMEOUT');
      done();
    });
  });

  it('kill all running processes', function(done) {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/100ms.js')],
      logger: log
    };

    // Kill all the processes once started
    setTimeout(function() {
      yexec.killAll(log);
    }, 20);

    // Kick off a couple of processes
    async.times(2, function(n, cb) {
      yexec(params, cb);
    }, function(err) {
      if (err) return done(err);
      assert.equal(yexec.getRunningPids().length, 0);
      
      done();
    });
  });
});

function Log() {
  this._info = [];
  this._warn = [];
  this._error = [];
}

['info', 'warn', 'error'].forEach(function(level) {
  Log.prototype[level] = function(msg) {
    this['_' + level].push(msg);
  };
});

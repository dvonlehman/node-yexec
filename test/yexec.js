var assert = require('assert');
var path = require('path');
var yexec = require('..');

describe('yexec', () => {
  it('error for missing command', async () => {
    let error;
    try {
      await yexec({ executable: 'missing_cmd', args: [] });
    } catch (err) {
      error = err;
    }
    assert.ok(error);
    assert.ok(/ENOENT/.test(error.message));
  });

  it('error with non-zero exit code', async () => {
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/fail.js')]
    };

    let error;
    try {
      await yexec(params);
    } catch (err) {
      error = err;
    }

    assert.ok(error);
    assert.equal(error.code, 1);
  });

  it('captures stdout and stderr', async () => {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/success.js')],
      logger: log
    };

    await yexec(params);
    assert.equal(log._info.length, 1);
    assert.equal('stdout message', log._info[0]);
    assert.equal(log._warn.length, 1);
    assert.equal('stderr message', log._warn[0]);
  });

  it('filters log events passing in array of patterns', async () => {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/success.js')],
      logger: log,
      logFilter: [/stdout/]
    };

    await yexec(params);
    assert.equal(log._info.length, 1);
    assert.equal(log._warn.length, 0);
  });

  it('filters logging with function', async () => {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/success.js')],
      logger: log,
      logFilter: function(level, msg) {
        return level !== 'info';
      }
    };
    await yexec(params);

    assert.equal(log._info.length, 0);
    assert.equal(log._warn.length, 1);
  });

  it('kills process if not finished within timeout period', async () => {
    var log = new Log();
    var params = {
      executable: 'node',
      args: [path.join(__dirname, './fixtures/100ms.js')],
      logger: log,
      timeout: 20
    };

    let error;
    try {
      await yexec(params);
    } catch (err) {
      error = err;
    }

    assert.ok(error);
    assert.equal(error.code, 'TIMEOUT');
  });

  it('kill all running processes', async () => {
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

    Promise.all([yexec(params), yexec(params)]);

    assert.equal(yexec.getRunningPids().length, 2);
    yexec.killAll(log);

    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(yexec.getRunningPids().length, 0);
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

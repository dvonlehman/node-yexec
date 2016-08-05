var pick = require('lodash.pick');
var path = require('path');
var spawn = require('child_process').spawn;
var isFunction = require('lodash.isfunction');
var isNumber = require('lodash.isnumber');
var isArray = require('lodash.isarray');
var some = require('lodash.some');
var debug = require('debug')('yexec');

module.exports = function(params, callback) {
  var options = pick(params, 'cwd', 'env');
  options.stdio = 'pipe';

  var executableBaseName = path.basename(params.executable);

  debug('spawning %s %s', params.executable, params.args.join(' '));

  var process;
  try {
    process = spawn(params.executable, params.args, options);
  } catch (err) {
    return callback(err);
  }

  var processExited;
  var filter;

  // If the
  if (isArray(params.logFilter)) {
    filter = function(level, msg) {
      return !some(params.logFilter, function(pattern) {
        return isFunction(pattern.test) && pattern.test(msg);
      });
    }
  } else if (isFunction(params.logFilter)) {
    filter = params.logFilter;
  } else {
    filter = function() {
      return true;
    }
  }

  var log = function(level, data) {
    if (!params.logger) return;
    var msg = data.toString().trim();
    if (msg.length === 0) return;
    if (filter(level, msg)) {
      params.logger[level](msg);
    }
  };

  // Log stdout to the log as info
  process.stdout.on('data', function(data) {
    log('info', data);
  });

  // Log stderr as level warn
  process.stderr.on('data', function(data) {
    log('warn', data);
  });

  process.on('error', function(err) {
    log('error', err);

    if (processExited) return;
    processExited = true;
    callback(new Error('Error returned from ' + executableBaseName + ': ' + err.message));
  });

  process.on('exit', function(code) {
    if (processExited) return;
    processExited = true;
    if (isNumber(code) && code !== 0) {
      var error = new Error('Process ' + executableBaseName + ' failed with code ' + code);
      error.code = code;
      callback(error);
    } else {
      callback();
    }
  });
};

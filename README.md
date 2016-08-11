# yexec

[![Build Status](https://travis-ci.org/dvonlehman/node-yexec.svg?branch=master)](https://travis-ci.org/dvonlehman/node-yexec)
[![Coverage Status](https://coveralls.io/repos/github/dvonlehman/node-yexec/badge.svg?branch=master)](https://coveralls.io/github/dvonlehman/node-yexec?branch=master)

Yet another process execution wrapper. Uses `child_process.spawn` to execute an external process and capture `stdout` and `stderr`.

* Logs `stdout` and `stderr` to a logger implementation of your choice as long as it supports the standard level functions like `info`, `warn`, and `error`.
* Supports optional log filter
* Protects against double callbacks from `error` and `exit` events.
* Invokes callback with an Error if process exits with non-zero code
* Specify an optional timeout. If the process has not exited within the interval the process is force killed and a `TIMEOUT` error is passed in the callback.

### Usage

~~~sh
npm install yexec
~~~

~~~js
var yexec = require('yexec');
var winston = require('winston');

var params = {
  executable: 'git',
  args: ['clone', 'https://github.com/nodejs/node.git'],
  logger: winston,
  timeout: 5000, // 5 seconds
  logFilter: function(level, msg) {
    return level !== 'info';
  }
};

yexec(params, function(err) {
  // If timeout occurred, err.code will be 'TIMEOUT'
  winston.error('Oops, git failed with code %s', err.code);
});
~~~

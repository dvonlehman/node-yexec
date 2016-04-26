# yexec

[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Yet another process execution wrapper. Uses `child_process.spawn` to execute an external process and capture `stdout` and `stderr`.

* Logs `stdout` and `stderr` to a logger implementation of your choice as long as it supports the standard level functions like `info`, `warn`, and `error`.
* Supports optional log filter
* Protects against double callbacks from `error` and `exit` events.
* Invokes callback with an Error if process exits with non-zero code

### Usage

~~~js
var yexec = require('yexec');
var winston = require('winston');

var params = {
  executable: 'git',
  args: ['clone', 'https://github.com/nodejs/node.git'],
  logger: winston,
  logFilter: function(msg, level) {
    return level !== 'info';
  }
};

yexec(params, function(err) {
  winston.error('Oops, git failed with code %s', err.code);
});
~~~

[travis-image]: https://img.shields.io/travis/dvonlehman/yexec.svg?style=flat
[travis-url]: https://travis-ci.org/dvonlehman/yexec
[coveralls-image]: https://img.shields.io/coveralls/dvonehman/yexec.svg?style=flat
[coveralls-url]: https://coveralls.io/r/dvonehman/yexec?branch=master

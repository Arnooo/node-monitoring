[![Build Status](https://travis-ci.org/Arnooo/node-monitoring.svg)](https://travis-ci.org/Arnooo/node-monitoring)

node-monitoring
===============

This module allow to manage a set of probes, ie sensors. Collect their data, store them in mysql DB. You can use the monitoring client to have an UI to view and manages probes.

## Installation

    npm install node-monitoring

## Usage

    var monitor = require('node-monitoring').create();

    if(jsonData){
        monitor.process(req.url.query.callback, req, res, jsonData);
    }
    else{
        monitor.process(req.url.query.callback, req, res);
    }

  console.log('html', html, 'escaped', escaped, 'unescaped', unescaped);

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release

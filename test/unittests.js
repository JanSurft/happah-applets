"use strict";
require.config({
     shim: {
          'three': {
               exports: 'THREE'
          },
          'QUnit': {
               exports: 'QUnit',
               init: function() {
                    QUnit.config.autoload = false;
                    QUnit.config.autostart = false;
               }
          }
     },
     paths: {
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "http://threejs.org/build/three",
          QUnit: 'https://code.jquery.com/qunit/qunit-1.23.0'
     }
});

// require the unit tests.
require(
     ['QUnit', 'three', 'curvetest'],
     function(QUnit, THREE, curvetest) {
          // run the tests.
          //curvetest.run();
          curvetest.run();
          // start QUnit.
          QUnit.load();
          QUnit.start();
     }
);

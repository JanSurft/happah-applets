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
          },
     },
     paths: {
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "http://threejs.org/build/three",
          QUnit: 'https://code.jquery.com/qunit/qunit-1.23.0'
     },
});

require(
     ['QUnit', 'three', './decasteljaualgorithmtest'],
     function(QUnit, THREE, DECASTELJAU_TEST) {
          DECASTELJAU_TEST.run();
          QUnit.load();
          QUnit.start();
     }
);

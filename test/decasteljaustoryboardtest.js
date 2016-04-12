//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

/** Unit tests for curve class. */

"use strict";
define(['../js/decasteljaustoryboard'], function(HAPPAH) {
     var run = function() {
          test('Generate a Storyboard for De Casteljau algorithm.', function() {
               // calc
               var controlpoints = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(16, 0, 0),
                    new THREE.Vector3(16, 16, 0),
                    new THREE.Vector3(0, 16, 0),
               ];
               var storyboard = decasteljaustoryboard.deCasteljauStoryboard();
          });
     };

     return {
          run: run
     }
});

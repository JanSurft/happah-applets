//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

/** Unit tests for curve class. */

"use strict";
define(['../js/curve'], function(CURVE) {
     var run = function() {
          test('Generated curve points of subdivision using de casteljau should equal precalced ones.', function() {
               var expectedResult = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(1.9375, 0.0625, 0),
                    new THREE.Vector3(2.8125, 0.1796875, 0),
                    new THREE.Vector3(3.6875, 0.296875, 0),
                    new THREE.Vector3(4.5, 0.46875, 0),
                    new THREE.Vector3(5.25, 0.6875, 0),
                    new THREE.Vector3(6, 0.90625, 0),
                    new THREE.Vector3(6.6875, 1.171875, 0),
                    new THREE.Vector3(7.3125, 1.4765625, 0),
                    new THREE.Vector3(7.9375, 1.78125, 0),
                    new THREE.Vector3(8.5, 2.125, 0),
                    new THREE.Vector3(9, 2.5, 0),
                    new THREE.Vector3(9.5, 2.875, 0),
                    new THREE.Vector3(9.9375, 3.28125, 0),
                    new THREE.Vector3(10.3125, 3.7109375, 0),
                    new THREE.Vector3(10.6875, 4.140625, 0),
                    new THREE.Vector3(11, 4.59375, 0),
                    new THREE.Vector3(11.25, 5.0625, 0),
                    new THREE.Vector3(11.5, 5.53125, 0),
                    new THREE.Vector3(11.6875, 6.015625, 0),
                    new THREE.Vector3(11.8125, 6.5078125, 0),
                    new THREE.Vector3(11.9375, 7, 0),
                    new THREE.Vector3(12, 7.5, 0),
                    new THREE.Vector3(12, 8, 0),
                    new THREE.Vector3(12, 8.5, 0),
                    new THREE.Vector3(11.9375, 9, 0),
                    new THREE.Vector3(11.8125, 9.4921875, 0),
                    new THREE.Vector3(11.6875, 9.984375, 0),
                    new THREE.Vector3(11.5, 10.46875, 0),
                    new THREE.Vector3(11.25, 10.9375, 0),
                    new THREE.Vector3(11, 11.40625, 0),
                    new THREE.Vector3(10.6875, 11.859375, 0),
                    new THREE.Vector3(10.3125, 12.2890625, 0),
                    new THREE.Vector3(9.9375, 12.71875, 0),
                    new THREE.Vector3(9.5, 13.125, 0),
                    new THREE.Vector3(9, 13.5, 0),
                    new THREE.Vector3(8.5, 13.875, 0),
                    new THREE.Vector3(7.9375, 14.21875, 0),
                    new THREE.Vector3(7.3125, 14.5234375, 0),
                    new THREE.Vector3(6.6875, 14.828125, 0),
                    new THREE.Vector3(6, 15.09375, 0),
                    new THREE.Vector3(5.25, 15.3125, 0),
                    new THREE.Vector3(4.5, 15.53125, 0),
                    new THREE.Vector3(3.6875, 15.703125, 0),
                    new THREE.Vector3(2.8125, 15.8203125, 0),
                    new THREE.Vector3(1.9375, 15.9375, 0),
                    new THREE.Vector3(1, 16, 0),
                    new THREE.Vector3(0, 16, 0),
               ];

               // calc
               var controlpoints = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(16, 0, 0),
                    new THREE.Vector3(16, 16, 0),
                    new THREE.Vector3(0, 16, 0),
               ];
               var mycurve = new CURVE.Curve(controlpoints);
               var curveSegments = mycurve.subdivide();

               // check result
               for (var i in curveSegments) {
                    equal(curveSegments[i].x, expectedResult[i].x);
                    equal(curveSegments[i].y, expectedResult[i].y);
                    equal(curveSegments[i].z, expectedResult[i].z);
               }
          });
     };

     return {
          run: run
     }
});

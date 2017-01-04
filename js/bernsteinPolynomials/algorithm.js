//////////////////////////////////////////////////////////////////////////////
//
// @author: Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', '../lib/storyboard', '../lib/spherical-impostor', '../lib/util'], function($, THREE, STORYBOARD, sphericalimpostor, UTIL) {
     const outside_color = 0xE2E2E2;

     var s_factorial = Symbol('factorial');
     var s_origin = Symbol('origin');

     class Algorithm {

          constructor(origin) {
               //this[s_controlPoints] = controlPoints;
               this[s_origin] = origin;
               this.storyboard = this.storyboard.bind(this);
               this.binomial = this.binomial.bind(this);
          }

          /**
           * Calculates binomial coefficient
           * @url: http://www.w3resource.com/javascript-exercises/javascript-math-exercise-20.php
           */
          binomial(n, k) {
               if ((typeof n !== 'number') || (typeof k !== 'number')) {
                    return false;
               }

               var coeff = 1;
               for (var x = n - k + 1; x <= n; x++) {
                    coeff *= x;
               }

               for (x = 1; x <= k; x++) {
                    coeff /= x;
               }

               return coeff;
          }

          /**
           * Calculate from 0 to 1
           * TODO: continue curves
           */
          evaluate(i, n, min, max) {
               var points = [];
               var binomial = this.binomial(n, i);

               for (var t = min; t <= max; t += 0.02) {
                    var y = binomial * Math.pow(t, i) * Math.pow(1 - t, n - i);
                    var point = new THREE.Vector3(t * 100, 0, -y * 100);
                    points.push(point.add(this[s_origin]));
               }
               return points;
          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               // Create the first frame by hand
               var storyboard = new STORYBOARD.Storyboard(this);

               for (var i = 0; i < 5; i++) {
                    for (var k = 0; k <= i; k++) {
                         var frame = new STORYBOARD.Storyboard.Frame();
                         // Get a new color from gradient
                         var color = 0xFF0000 + ((i + k) * 100000);

                         // Create outer-left line
                         frame.lines.push(UTIL.Util.insertSegmentStrip(this.evaluate(k, i, -10, 0), outside_color));

                         // Create inner lines in full-color
                         frame.lines.push(UTIL.Util.insertSegmentStrip(this.evaluate(k, i, 0, 1.02), color));

                         // Create outer-right line
                         frame.lines.push(UTIL.Util.insertSegmentStrip(this.evaluate(k, i, 1, 10), outside_color));
                         frame.title = "B" + k + "," + i + "(t)";

                         // Concat with previous iterations -> of same degree
                         if (k != 0) {
                              frame.lines = frame.lines.concat(storyboard.frame(storyboard.size() - 1).lines);
                         }
                         storyboard.append(frame);
                    }
               }

               return storyboard;
          }

     }

     return {
          Algorithm: Algorithm
     };
});

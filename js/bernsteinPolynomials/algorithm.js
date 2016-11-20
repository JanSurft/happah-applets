//////////////////////////////////////////////////////////////////////////////
//
// @author: Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', '../lib/storyboard', '../lib/spherical-impostor'], function($, THREE, STORYBOARD, sphericalimpostor) {
     var s_factorial = Symbol('factorial');
     var s_origin = Symbol('origin');

     class Algorithm {

          constructor(origin) {
               //this[s_controlPoints] = controlPoints;
               this[s_origin] = origin;
               this.storyboard = this.storyboard.bind(this);
               this.binomial = this.binomial.bind(this);
               this.insertSegmentStrip = this.insertSegmentStrip.bind(this);
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

          insertSegmentStrip(points, color) {
               if (points == null || points.length == 0)
                    return null;

               var lineGeometry = new THREE.Geometry();
               var lineMaterial = new THREE.LineBasicMaterial({
                    color: color,
                    linewidth: 5
               });

               for (var i = 0; i < points.length; i++) {
                    lineGeometry.vertices.push(points[i]);
               }
               lineGeometry.computeLineDistances();
               return new THREE.Line(lineGeometry, lineMaterial);
          }

          /**
           * calc from 0 to 1
           */
          evaluate(i, n) {
               var points = [];
               var binomial = this.binomial(n, i);

               for (var t = 0; t <= 1; t += 0.1) {
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
               var frame0 = new STORYBOARD.Storyboard.Frame();
               var points = this.evaluate(0, 0);
               frame0.lines[0] = this.insertSegmentStrip(points, 0xff0000);
               frame0.title = "B0,0(t)";
               storyboard.append(frame0);

               var frame1 = new STORYBOARD.Storyboard.Frame();
               points = this.evaluate(0, 1);
               frame1.lines[0] = this.insertSegmentStrip(points, 0xff0000);
               frame1.title = "B0,1(t)";
               storyboard.append(frame1);

               var frame2 = new STORYBOARD.Storyboard.Frame();
               points = this.evaluate(1, 1);
               frame2.lines[0] = this.insertSegmentStrip(points, 0xff0000);
               frame2.title = "B1,1(t)";
               storyboard.append(frame2);

               var frame3 = new STORYBOARD.Storyboard.Frame();
               points = this.evaluate(0, 2);
               frame3.lines[0] = this.insertSegmentStrip(points, 0xff0000);
               frame3.title = "B0,2(t)";
               storyboard.append(frame3);

               var frame4 = new STORYBOARD.Storyboard.Frame();
               points = this.evaluate(1, 2);
               frame4.lines[0] = this.insertSegmentStrip(points, 0xff0000);
               frame4.title = "B1,2(t)";
               storyboard.append(frame4);

               var frame5 = new STORYBOARD.Storyboard.Frame();
               points = this.evaluate(2, 2);
               frame5.lines[0] = this.insertSegmentStrip(points, 0xff0000);
               frame5.title = "B2,2(t)";
               storyboard.append(frame5);

               return storyboard;
          }

     }

     return {
          Algorithm: Algorithm
     };
});

//////////////////////////////////////////////////////////////////////////////
//
// Generalized deCasteljau algorithm
// Decasteljau's algorithm that uses different ratios each iteration.
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', 'lib/happah', 'lib/util'], function($, THREE, HAPPAH, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');
     var s_scrollbar = Symbol('scrollbar');
     var s_camera = Symbol('camera');
     var s_colors = Symbol('colors');
     var s_color = Symbol('color');
     var s_handles = Symbol('handles');

     class Algorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar, camera) {
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_ratio] = (scrollbar == null) ? 0.5 : scrollbar.value;
               this[s_scrollbar] = scrollbar;
               this[s_camera] = camera;
               this[s_color] = 0xE50A00;
               this[s_handles] = [];

               // Initial color
               this[s_colors] = [0xFF0000];
          }

          /**
           * Set scrollbar
           */
          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
          }

          evaluate(callback = null) {
               var segmentLength = this[s_controlPoints].length;
               var points = new Array(segmentLength);
               points[0] = new Array(segmentLength);
               for (var i in this[s_controlPoints]) {
                    points[0][i] = this[s_controlPoints][i];
               }
               // Until only 1 point remains
               for (var i = 0; i < segmentLength - 1; i++) {
                    points[i + 1] = new Array(segmentLength - i - 1);
                    // Calc next level points
                    for (var j = 0; j < points[i].length - 1; j++) {
                         var newPoint = points[i][j].clone();
                         // Not sure if value(i) or (i-1)
                         newPoint.multiplyScalar(1 - this[s_scrollbar].valueOf(i));
                         var tmpPoint = points[i][j + 1].clone();
                         tmpPoint.multiplyScalar(this[s_scrollbar].valueOf(i));
                         newPoint.add(tmpPoint);
                         points[i + 1][j] = newPoint;
                    }
                    callback(points[i + 1]);
               }
               //return points[points.length - 1][0];
               return points;

          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               // Create the first frame by hand
               var storyboard = new HAPPAH.Storyboard(this);
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.lines[0] = UTIL.Util.insertSegmentStrip(this[s_controlPoints], 0xff0000);
               frame0.points = this[s_controlPoints];
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    return storyboard;
               }

               // Update handles
               for (var i = 0; i < this[s_controlPoints].length - 2; i++) {
                    if (this[s_handles][i] != null) {
                         //this[s_handles][i].position.x = (0.5 / 150) + 0.5;
                    } else {
                         this[s_color] += 0x0E5034;
                         this[s_handles].push(this[s_scrollbar].addHandle(0.5, this[s_color]));
                    }
               }

               var pointMatrix = this.evaluate(function() {});

               //pointMatrix.push(this[s_controlPoints]);

               //this.evaluate(function add(points) {
               //pointMatrix.push(points);
               //});

               // Iterate over scrollbar and add polygon each iteration
               for (var i = 1; i < pointMatrix.length; i++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step: " + i;

                    frame.points = pointMatrix[i];

                    if (frame.points.length > 1) {
                         frame.lines.push(UTIL.Util.insertSegmentStrip(frame.points, this[s_handles][i - 1].material.color));
                    }

                    // Include lines and points from previous iterations
                    frame.lines = frame.lines.concat(storyboard.lastFrame().lines);
                    //frame.points = frame.points.concat(storyboard.lastFrame().points);
                    storyboard.append(frame);
               }

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

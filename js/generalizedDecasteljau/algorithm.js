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

     class Algorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar, camera) {
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_ratio] = (scrollbar == null) ? 0.5 : scrollbar.value;
               this[s_scrollbar] = scrollbar;
               this[s_camera] = camera;
          }

          /**
           * Set scrollbar
           */
          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
          }

          /**
           * Simplified evaluate method that calculates a single step of
           * de Casteljaus algorithm
           */
          evaluate(points, ratio) {
               var newPoints = [];
               for (var i = 0; i < points.length - 1; i++) {
                    var newPoint = points[i].clone();
                    newPoint.multiplyScalar(1 - ratio);
                    var tmpPoint = points[i + 1].clone();
                    tmpPoint.multiplyScalar(ratio);
                    newPoint.add(tmpPoint);
                    newPoints.push(newPoint);
               }
               return newPoints;
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

               // Iterate over scrollbar and add polygon each iteration
               for (var i in this[s_scrollbar]) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step: " + i;

                    // Evaluate with a different ratio for every step
                    frame.points = this.evaluate(storyboard.lastFrame().points,
                         this[s_scrollbar][i].value);
                    frame.lines.push(UTIL.Util.insertSegmentStrip(frame.points, 0x1288FF));

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

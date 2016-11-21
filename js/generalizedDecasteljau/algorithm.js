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
     var s_scrollbars = Symbol('scrollbars');
     var s_camera = Symbol('camera');

     class Algorithm extends HAPPAH.DeCasteljauAlgorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar, camera) {
               super(controlPoints, scrollbar);
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_ratio] = (scrollbar == null) ? 0.5 : scrollbar.value;
               this[s_scrollbars] = [scrollbar];
               this[s_camera] = camera;
          }

          set scrollbars(scrollbars) {
               this[s_scrollbars] = scrollbars;
               // super.scrollbar = scrollbar;
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
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    return storyboard;
               }

               // TODO: reimplement algorithm to use different ratios
               //       dont use subdivide
               // Iterate over scrollbars and add polygon each iteration
               for (var i in this[s_scrollbars]) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step: " + i;
                    var points = this.subdivide(1, this[s_scrollbars][i].value);
                    frame.lines.push(UTIL.Util.insertSegmentStrip(points, 0x1288FF));
                    frame.lines = frame.lines.concat(storyboard.lastFrame().lines);
                    storyboard.append(frame);
               }

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

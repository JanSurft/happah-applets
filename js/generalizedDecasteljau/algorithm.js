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

               // second frame
               var frame1 = new HAPPAH.Storyboard.Frame();
               var points = this.subdivide(1, this[s_scrollbars][0].value);
               frame1.lines[0] = UTIL.Util.insertSegmentStrip(points, 0x123432);
               //frame1.points.concat(points);
               for (var i in points) {
                    frame1.points.push(points[i].clone());
               }
               frame1.title = "frame 1";
               storyboard.append(frame1);

               // third frame
               var frame2 = new HAPPAH.Storyboard.Frame();
               points = this.subdivide(2, this[s_scrollbars][1].value);
               frame2.lines[0] = UTIL.Util.insertSegmentStrip(points, 0x543121);
               //frame2.points.concat(points);
               for (var i in points) {
                    frame2.points.push(points[i].clone());
               }
               storyboard.append(frame2);


               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

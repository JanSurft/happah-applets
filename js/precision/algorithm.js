//////////////////////////////////////////////////////////////////////////////
//
// Algorithm for app 'linear precision'
//
// Let n points be equally distributed on a straight line. After applying the
// de'Casteljau algorithm on this control polygon, the last added point will
// divide the start point s and the end point e in the ratio t:(1-t).
// Let t be 2/3
//                          p=te+(1-t)s
//      *-----------------------*-----------*
//     (s)                      :          (e)
//                      *-------.---*
//                      :           :
//              *-------.---*-------.---*
//              :           :           :
//      *-------.---*-------.---*-------.---* Step 0
//     (s)                                 (e)
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', 'lib/happah'], function($, THREE, HAPPAH) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');
     var s_scrollbar = Symbol('scrollbar');

     class Algorithm extends HAPPAH.DeCasteljauAlgorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar) {
               super(controlPoints, scrollbar);
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_ratio] = (scrollbar == null) ? 0.5 : scrollbar.value;
               this[s_scrollbar] = scrollbar;
          }

          // we need this, because scrolbar gets set after the constructor call
          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
               super.scrollbar = scrollbar;
          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               var ratio;
               if (this[s_scrollbar] == null) {
                    ratio = 0.5;
               } else {
                    ratio = this[s_scrollbar].value;
               }
               // Create the first frame by hand
               var storyboard = new HAPPAH.Storyboard(this);
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.meshes[0] = insertSegmentStrip(this[s_controlPoints], 0xff0000);
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.meshes[0] = new THREE.Object3D();
                    return storyboard;
               }

               // each iteration step gets stored in a matrix row
               var pointMatrix = new Array();

               // First set of points is the control polygon
               pointMatrix.push(this[s_controlPoints]);

               // fill matrix with points from each iteration
               this.evaluate(ratio, function add(points) {
                    pointMatrix.push(points);
               });

               for (var i = 1; i < pointMatrix.length; i++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step " + i;

                    frame.points = pointMatrix[i];

                    var pointStack = new Array();

                    // The previous iteration has one point more.
                    for (var k in pointMatrix[i]) {
                         // Push first one from last iteration
                         pointStack.push(pointMatrix[i - 1][k]);

                         // Now add one point from current iteration
                         pointStack.push(pointMatrix[i][k]);
                    }
                    // Add last point from previous iteration
                    pointStack.push(pointMatrix[i - 1][pointMatrix[i - 1].length - 1]);

                    // Iterate over stacksize and make a segment from 2 points
                    for (var k = 2; k <= pointStack.length; k++) {
                         var segment = new Array();
                         segment.push(pointStack[k - 1]);
                         segment.push(pointStack[k - 2]);
                         // Paint the strips in the interval's color
                         var strip = (k % 2 == 0) ?
                              insertSegmentStrip(segment, 0x3D3D3D) : insertSegmentStrip(segment, 0xFF0000);
                         frame.meshes.push(strip);

                    }

                    // Merge with the previous frame's meshes
                    if (i != 1) {
                         frame.meshes = frame.meshes.concat(storyboard.frame(storyboard.size() - 1).meshes);
                         // Remove the last mesh from the previous iteration
                         // to prevent overlapping lines
                         frame.meshes.pop();
                    }
                    // Also add the newly generated polygon
                    frame.meshes.push(insertSegmentStrip(pointMatrix[i], 0xFF0000));
                    frame.points = frame.points.concat(storyboard.frame(storyboard.size() - 1).points);
                    storyboard.append(frame);
               }
               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

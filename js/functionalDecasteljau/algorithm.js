//////////////////////////////////////////////////////////////////////////////
//
// Extended deCasteljau algorithm
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', 'lib/happah', 'lib/util'], function($, THREE, HAPPAH, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');
     var s_scrollbar = Symbol('scrollbar');
     var s_camera = Symbol('camera');

     class Algorithm extends HAPPAH.DeCasteljauAlgorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar, camera) {
               super(controlPoints, scrollbar);
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_ratio] = (scrollbar == null) ? 0.5 : scrollbar.value;
               this[s_scrollbar] = scrollbar;
               this[s_camera] = camera;
          }

          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
               // super.scrollbar = scrollbar;
          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               var ratio;
               if (this[s_scrollbar] == null) {
                    console.log("scrollbar == null");
                    ratio = 0.5;
               } else {
                    ratio = this[s_scrollbar].value;
               }
               // Create the first frame by hand
               var storyboard = new HAPPAH.Storyboard(this);
               //var frame0 = new HAPPAH.Storyboard.Frame();
               //frame0.title = "Controlpolygon";
               //storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    var frame0 = new HAPPAH.Storyboard.Frame();
                    // Add a dummy mesh
                    frame0.lines[0] = UTIL.Util.insertSegmentStrip(this[s_controlPoints], 0xff0000);
                    storyboard.append(frame0);
                    return storyboard;
               }
               // Also add dashed line for controlpoints
               //for (var i in this[s_controlPoints]) {
               //frame0.lines.push(UTIL.Util.insertDashedLine([this[s_controlPoints][i], this[s_controlPoints][i].clone().setZ(60)], 0x000000));
               //}

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
                    frame.points = pointMatrix[i];
                    var pointStack = new Array();

                    // The previous iteration has one point more.
                    for (var k in pointMatrix[i]) {
                         // Push first one from last iteration
                         pointStack.push(pointMatrix[i - 1][k].clone());

                         // Now add one point from current iteration
                         pointStack.push(pointMatrix[i][k].clone());

                         // TODO: this needs to be parameterized
                         // Get relative point on the axis
                         var projectPoint = pointMatrix[i][k].clone();
                         projectPoint.z = 60;

                         // Add dashed line between point and projection
                         var line = UTIL.Util.insertDashedLine([pointMatrix[i][k].clone(), projectPoint], 0x000000);
                         frame.lines.push(line);
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
                              UTIL.Util.insertSegmentStrip(segment, 0x3D3D3D) : UTIL.Util.insertSegmentStrip(segment, 0xFF0000);
                         frame.lines.push(strip);

                    }
                    //frame.points = frame.points.concat(storyboard.frame(storyboard.size() - 1).points);
                    storyboard.append(frame);
               }

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

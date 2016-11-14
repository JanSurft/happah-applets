//////////////////////////////////////////////////////////////////////////////
//
// Extended deCasteljau algorithm
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', 'lib/happah'], function($, THREE, HAPPAH) {
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
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.lines[0] = insertSegmentStrip(this[s_controlPoints], 0xff0000);
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
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

               var frame = new HAPPAH.Storyboard.Frame();
               frame.points = pointMatrix[1];
               var pointStack = new Array();

               // Remove all labels
               //this[s_labelmanager].removeLabels();

               // The previous iteration has one point more.
               for (var k in pointMatrix[1]) {
                    // Push first one from last iteration
                    pointStack.push(pointMatrix[0][k]);

                    // Now add one point from current iteration
                    pointStack.push(pointMatrix[1][k]);

                    // Add a label
                    frame.labels.push(+(Math.round(pointMatrix[1][k].x + "e+2") + "e-2"));

                    // TODO: this needs to be parameterized
                    // Get relative point on the axis
                    var projectPoint = pointMatrix[1][k].clone();
                    projectPoint.z = 60;

                    // Add dashed line between point and projection
                    var line = insertDashedLine([pointMatrix[1][k], projectPoint], 0x000000);
                    frame.lines.push(line);
               }
               // Add last point from previous iteration
               pointStack.push(pointMatrix[0][pointMatrix[0].length - 1]);

               // Iterate over stacksize and make a segment from 2 points
               for (var k = 2; k <= pointStack.length; k++) {
                    var segment = new Array();
                    segment.push(pointStack[k - 1]);
                    segment.push(pointStack[k - 2]);
                    // Paint the strips in the interval's color
                    var strip = (k % 2 == 0) ?
                         insertSegmentStrip(segment, 0x3D3D3D) : insertSegmentStrip(segment, 0xFF0000);
                    frame.lines.push(strip);

               }

               //frame.points = frame.points.concat(storyboard.frame(storyboard.size() - 1).points);
               storyboard.append(frame);

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', './storyboard', './spherical-impostor'], function($, THREE, STORYBOARD, sphericalimpostor) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');
     var s_scrollbar = Symbol('scrollbar');

     /**
      * Encapsulate functionality of De' Casteljau algorithm.
      * takes t as division ratio and a callback function
      */
     class DeCasteljauAlgorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar) {
               this[s_controlPoints] = controlPoints;
               this.storyboard = this.storyboard.bind(this);

               this[s_scrollbar] = scrollbar;
               this[s_ratio] = (scrollbar == null) ? 0.5 : scrollbar.value;
          }

          evaluate(t = this[s_scrollbar].value, callback = null) {
               var segmentLength = this[s_controlPoints].length;
               var points = new Array(segmentLength);
               points[0] = new Array(segmentLength);
               for (var i in this[s_controlPoints]) {
                    points[0][i] = this[s_controlPoints][i];
               }
               // until only 1 point remains
               for (var i = 0; i < segmentLength - 1; i++) {
                    points[i + 1] = new Array(segmentLength - i - 1);
                    // calc next level points
                    for (var j = 0; j < points[i].length - 1; j++) {
                         var newPoint = points[i][j].clone();
                         newPoint.multiplyScalar(1 - t);
                         var tmpPoint = points[i][j + 1].clone();
                         tmpPoint.multiplyScalar(t);
                         newPoint.add(tmpPoint);
                         points[i + 1][j] = newPoint;
                    }
                    callback(points[i + 1]);
               }
               return points[points.length - 1][0];
          }

          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
          }

          /**
           * Calculate a curve segment strip  using the subdivision treat of the
           * De' Casteljau algorithm.
           *
           * Additional Memory usage: O(s*s),
           * where s is the length of a segment.
           *
           * @param nSubdivisions times the segmentstrip points are divided
           * @param t the factor/weight used in the De' Casteljau algorithm
           *
           * @return an array of ordered 3D Vectors on the curve
           */
          subdivide(nSubdivisions = 4, t = this[s_scrollbar].value) {
               // preCalculate necessary array length to avoid later size
               // changes
               var segmentLength = this[s_controlPoints].length;
               if (segmentLength == 0) {
                    return [];
               }
               var arrayLength = segmentLength;
               for (var i = 0; i < nSubdivisions; i++) {
                    arrayLength = 2 * arrayLength - 1;
               }
               // init array
               var result = new Array(arrayLength);
               for (var i = 0; i < segmentLength - 1; i++) {
                    result[i] = this[s_controlPoints][i].clone();
               }
               result[arrayLength - 1] = this[s_controlPoints][this[s_controlPoints].length - 1].clone();
               var iterator = arrayLength - 1;

               // start iterative calculation here
               for (var n = 0; n < nSubdivisions; n++) {
                    for (var segmentStart = 0; segmentStart < arrayLength - 1; segmentStart += iterator) {
                         var offset = Math.floor(iterator / 2);

                         // calc de casteljau subpoints
                         var localPoints = new Array(segmentLength);
                         localPoints[0] = new Array(segmentLength);

                         // copy local control points
                         for (var i = 0; i < segmentLength - 1; i++) {
                              localPoints[0][i] = result[segmentStart + i].clone();
                         }
                         localPoints[0][segmentLength - 1] = result[segmentStart + iterator].clone();
                         // calc a de casteljau point and save each step in an
                         // array
                         // the first element of each array is part of the left
                         // curve segment, the last is part of the right
                         // This part uses O(s*s) memory, where s is the
                         // defined length of a segment.
                         for (var i = 0; i < segmentLength - 1; i++) {
                              localPoints[i + 1] = new Array(segmentLength - i - 1);
                              for (var j = 0; j < localPoints[i].length - 1; j++) {
                                   var newPoint = localPoints[i][j].clone();
                                   newPoint.multiplyScalar(1 - t);
                                   var tmpPoint = localPoints[i][j + 1].clone();
                                   tmpPoint.multiplyScalar(t);
                                   newPoint.add(tmpPoint);
                                   localPoints[i + 1][j] = newPoint;
                              }
                         }

                         // add left segment to result
                         for (var i = 1; i < localPoints.length - 1; i++) {
                              result[segmentStart + i] = localPoints[i][0];
                         }
                         // add right segment to result
                         for (var i = 0; i < localPoints.length - 1; i++) {
                              result[segmentStart + offset + i] = localPoints[
                                   localPoints.length - 1 - i][localPoints[
                                   localPoints.length - 1 - i].length - 1];
                         }
                    }
                    iterator = Math.floor(iterator / 2);
               }
               return result;
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
               var storyboard = new STORYBOARD.Storyboard(this);
               var frame0 = new STORYBOARD.Storyboard.Frame();
               frame0.meshes[0] = insertSegmentStrip(this[s_controlPoints], 0xff0000);
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.meshes[0] = new THREE.Object3D();
                    return storyboard;
               }

               // matrix of points for every iteration
               var pointMatrix = new Array();

               // First set of points is the control polygon
               pointMatrix.push(this[s_controlPoints]);

               // fill matrix with points from each iteration
               this.evaluate(ratio, function add(points) {
                    pointMatrix.push(points);
               });

               // Skip the control polygon
               for (var i = 1; i < pointMatrix.length; i++) {
                    var frame = new STORYBOARD.Storyboard.Frame();
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

               // Create the last frame also by hand
               var frameLast = new STORYBOARD.Storyboard.Frame();
               frameLast.title = "Limes curve";
               frameLast.meshes[0] = insertSegmentStrip(this.subdivide(4, 0.5), 0xff0000);

               // Can't create a curve from two points.
               if (this[s_controlPoints].length > 2) {
                    storyboard.append(frameLast);
               }

               return storyboard;
          }

     }

     return {
          DeCasteljauAlgorithm: DeCasteljauAlgorithm
     };
});

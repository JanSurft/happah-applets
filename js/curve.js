//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three'], function($, THREE) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');

     /** Encapsulate functionality of De' Casteljau algorithm. */

     class Curve {


          /** Default constructor. */
          constructor(controlPoints) {
               this[s_controlPoints] = controlPoints;
          }

          evaluate(t, callback) {
               this.helper = function(controlPoints, depth, callback) {
                    if (depth == 0) {
                         return controlPoints;
                    }

                    var deCasteljauPoints = deCasteljeu(controlPoints);
                    var leftControlPoints = [];
                    var rightControlPoints = [];
                    for (level in deCasteljauPoints) {
                         leftControlPoints.push(level[0]);
                         rightControlPoints = [level[level.length - 1]]
                              .concat(rightControlPoints);
                    }

                    return (helper(leftControlPoints, depth - 1, callback))
                         .concat(helper(rightControlPoints, depth - 1,
                              callback));
               }
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
          subdivide(nSubdivisions = 4, t = 0.5) {
               // preCalculate necessary array length to avoid later size
               // changes
               var segmentLength = this[s_controlPoints].length;
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
     }
     return {
          Curve: Curve
     };
});

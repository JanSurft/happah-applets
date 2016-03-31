//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three'], function($, THREE) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');

     /** Encapsulate functionality of De' Castelieu algorithm. */

     class Curve {

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

          // Memory usage: O(n)
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
               for (var n = 0; n < nSubdivisions; n++) {
                    for (var segmentStart = 0; segmentStart < arrayLength - 1; segmentStart += iterator) {
                         var offset = Math.floor(iterator / 2);
                         // calc de casteljeau subpoints

                         var localPoints = new Array(segmentLength);
                         localPoints[0] = new Array(segmentLength);
                         // copy local control points
                         for (var i = 0; i < segmentLength - 1; i++) {
                              //localPoints[0][i] = result[segmentStart + i].clone();
                         }
                         //localPoints[0][segmentLength - 1] = result[segmentStart + iterator].clone();

                         for (var i = 0; i < segmentLength; i++) {
                              //localPoints[i + 1] = new Array(segmentLength - i - 1);
                              //for (var j = 0; j < localPoints[i].length - 1; j++) {
                              //var newPoint = localPoints[i][j].clone();
                              //var newPoint = localPoints[i][j].clone();
                              //newPoint.multiplyScalar(1 - t);
                              //var tmpPoint = localPoints[i][j + 1].clone();
                              //tmpPoint.multiplyScalar(t);
                              //newPoint.add(tmpPoint);
                              //localPoints[i + 1][j] = newPoint;
                              //}
                         }

                         for (var i = 1; i < localPoints.length - 2; i++) {
                              //result[segmentStart + i] = localPoints[i][0];
                         }

                         for (var i = 0; i < localPoints.length - 1; i++) {
                              //result[segmentStart + offset + i] = localPoints[
                              //localPoints.length - 1 - i][localPoints[
                              //localPoints.length - 1 - i].length - 1];
                         }
                    }
                    iterator = Math.floor(iterator / 2);
               }
               return result;
          }

          //this.deCasteljeu = function(controlPoints) {
          //var result = [controlPoints];
          //for (i = 0; i < controlPoints.length(); i++) {
          //var tempArray = [];
          //for (j = 0; j < result[0].length() - 1; j++) {
          //var newPoint = result[i][j].clone();
          //newPoint.multiplyScalar(1 - this[s_ratio]);
          //var tempPoint = result[i][j + 1].clone();
          //tempPoint.multiplyScalar(this[s_ratio]);
          //newPoint.add(tempPoint);
          //tempArray.push(newPoint);
          //}
          //result.push(tempArray);
          //}
          //return result;
          //}
     }
     return {
          Curve: Curve
     };
});

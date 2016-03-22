//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three'], function($, THREE, happah) {
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
               var segmentLength = this[controlPoints.length];
               var arrayLength = segmentLength;
               for (var i = 0; i < nSubdivisions; i++) {
                    arrayLength = 2 * arraySize - 1;
               }
               // init array
               var result = new Array(arrayLength);
               for (var i = 0; i < this[controlPoints].length - 1; i++) {
                    result[i] = this[controlPoints][i];
               }

               var iterator = arrayLength - 1;
               for (var n = 0; n < nSubdivisions; n++) {
                    for (var segmentStart = 0; segmentStart <= arrayLength - 1; segmentStart += iterator) {
                         // calc de casteljeau subpoints



                    }
                    iterator = Math.floor(iterator / 2);
               }
          }

          this.deCasteljeu = function(controlPoints) {
               var result = [controlPoints];
               for (i = 0; i < controlPoints.length(); i++) {
                    var tempArray = [];
                    for (j = 0; j < result[0].length() - 1; j++) {
                         var newPoint = result[i][j].clone();
                         newPoint.multiplyScalar(1 - this[s_ratio]);
                         var tempPoint = result[i][j + 1].clone();
                         tempPoint.multiplyScalar(this[s_ratio]);
                         newPoint.add(tempPoint);
                         tempArray.push(newPoint);
                    }
                    result.push(tempArray);
               }
               return result;
          }
     }
});

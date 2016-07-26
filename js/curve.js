//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', 'storyboard'], function($, THREE, STORYBOARD) {
    var s_controlPoints = Symbol('controlPoints');
    var s_ratio = Symbol('ratio');

    /**
     * Encapsulate functionality of De' Casteljau algorithm.
     * takes t as division ratio and a callback function
     */
    class Curve {

        /** Default constructor. */
        constructor(controlPoints) {
            this[s_controlPoints] = controlPoints;
        }

        evaluate(t = 0.5, callback = null) {
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

        storyboard(ratio = 0.5) {
            var result = new STORYBOARD.Storyboard();
            var frame0 = new STORYBOARD.Storyboard.Frame();
            frame0.meshes[0] = insertSegmentStrip(this[s_controlPoints], 0xff0000);
            frame0.title = "Kontrollpolygon";
            result.append(frame0);
            var i;
            var meshesMinusOne = [insertSegmentStrip(this[s_controlPoints], 0x3d3d3d)];

            var _this = this;
            // Add a frame for each iteration of decasteljau
            for (i = 1; i < this[s_controlPoints].length - 1 || i < 3; i++) {
                var frame = new STORYBOARD.Storyboard.Frame();
                frame.title = "Schritt: " + i;

                // Add previous polygons in grey
                /*
                for (var k = 1; k < i; k++) {
                    frame.meshes.push(insertSegmentStrip(this.subdivide(k, ratio), 0x535353));
                }
                for (var k in result.frame) {
                    for (var v in result.frame[k].meshes) {
                        var mesh = result.frame[k].meshes[v];
                        if (mesh != null)
                            mesh.material.color.set(0x3d3d3d);
                        frame.meshes.push(mesh);
                    }
                }
                */
                for (var k in meshesMinusOne) {
                    frame.meshes[k] = meshesMinusOne[k];
                }

                // Start and end point need to be included
                //frame.points.push(this[s_controlPoints][0]);
                //frame.points.push(this[s_controlPoints][this[s_controlPoints].length - 2]);
                this.evaluate(ratio, function add(points) {
                    frame.points.push(points);
                });
                var points = this.subdivide(i, ratio);
                // Add geometry of current
                if (frame.points[i - 1] != null) {
                    var mesh = insertSegmentStrip(frame.points[i - 1], 0x3d3d3d);
                    frame.meshes.push(mesh);
                    var mesh2 = insertSegmentStrip(frame.points[i - 1], 0x3d3d3d);
                    meshesMinusOne.push(mesh2);
                }
                frame.meshes.push(insertSegmentStrip(points, 0xff0000));
                result.append(frame);
            }

            //TODO: add point to last frame, so you can move it around
            var frameLast = new STORYBOARD.Storyboard.Frame();
            frameLast.title = "Grenzkurve";
            frameLast.meshes[0] = insertSegmentStrip(this[s_controlPoints], 0x3d3d3d);
            frameLast.meshes[1] = insertSegmentStrip(this.subdivide(4, 0.5), 0xff0000);
            frameLast.isStatic = true;
            result.append(frameLast);

            return result;
        }

    }

    return {
        Curve: Curve
    };
});

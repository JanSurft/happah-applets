//////////////////////////////////////////////////////////////////////////////
//
// Line for interpolation
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'storyboard'], function($, THREE, happah) {
    var s_controlPoints = Symbol('controlPoints');

    class Line {

        constructor(controlPoints) {
            this[s_controlPoints] = controlPoints;
        }

        interpolate(ratio = 0.5) {
            var a = this[s_controlPoints][0];
            var b = this[s_controlPoints][1];
            var line = new THREE.Line3(a, b);

            return a.addScaledVector(b, ratio);

        }

        // Create a storyboard with five iterations
        // with different ratios each
        storyboard() {
            var storyboard = new happah.Storyboard();
            var frame0 = new happah.Storyboard.Frame();
            frame0.title = "Test";
            storyboard.append(frame0);

            if (this[s_controlPoints].length == 0) {
                return storyboard;
            }

            var points = new Array();
            points.push(this[s_controlPoints][0]);
            points.push(this.interpolate(0.5));
            frame0.points.push(points[1]);
            points.push(this.interpolate(0.25));
            frame0.points.push(points[2]);
            points.push(this[s_controlPoints][1]);

            frame0.meshes.push(insertSegmentStrip(points, 0x3344ff));

            return storyboard;
        }

    } //class Line
    return {
        Line: Line
    };
});

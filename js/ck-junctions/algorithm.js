//////////////////////////////////////////////////////////////////////////////
//
// @author Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['three', '../lib/happah'], function(THREE, HAPPAH) {

     var s_controlPoints = Symbol('controlPoints');
     var s_extraPoints = Symbol('extrapoints');
     var s_scrollbar = Symbol('scrollbar');
     var s_camera = Symbol('camera');

     class Algorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar, camera) {
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_scrollbar] = scrollbar;
               this[s_camera] = camera;
               var origin = new THREE.Vector3(120, 0, -30);
               this[s_extraPoints] = [
                    new THREE.Vector3(-60, 0, 0).add(origin),
                    new THREE.Vector3(-20, 0, 0).add(origin),
                    new THREE.Vector3(20, 0, 0).add(origin),
                    new THREE.Vector3(60, 0, 0).add(origin),
               ];
          }

          /**
           * Set scrollbar
           */
          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               // For simplicity create some local variables
               var controlPoints = this[s_controlPoints];
               var extraPoints = this[s_extraPoints];

               // Create the first frame by hand
               var storyboard = new HAPPAH.Storyboard(this);
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.title = "Controlpolygon";
               frame0.lines.push(HAPPAH.Util.insertSegmentStrip(controlPoints,
                    HAPPAH.Colors.RED));
               frame0.lines.push(HAPPAH.Util.insertSegmentStrip(extraPoints,
                    HAPPAH.Colors.RED));
               storyboard.append(frame0);
               var imp_template = new HAPPAH.SphericalImpostor(3);
               imp_template.material.uniforms.diffuse.value.set(0x00ff00);

               for (var i of extraPoints) {
                    var imp = imp_template.clone();
                    imp.position.copy(i);
                    frame0.points.add(imp);
               }

               if (controlPoints.length < 3) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    storyboard.index = 0;
                    return storyboard;
               }

               // characteristic points for ck junctions
               // ======================================
               // 1. To joint two curves some of the endpoints of the curves
               // have to be manipulated. The positions of those points can be
               // calculated using the de' Casteljau construction of the
               // characterizing points.
               // 2. Divide the junction into the left and right part
               // respective for the two curves.
               var b = this[s_scrollbar];
               var characteristicPoints = [
                    // the c^0 junction is a special case!
                    // [controlPoints[controlPoints.length - 1]],
                    [
                         controlPoints[controlPoints.length - 2],
                         extraPoints[1],
                    ],
                    [
                         controlPoints[controlPoints.length - 3],
                         controlPoints[controlPoints.length - 3].clone().add((
                              controlPoints[controlPoints.length - 2].clone().sub(
                                   controlPoints[controlPoints.length - 3])
                         ).multiplyScalar(1 / b.value)),
                         extraPoints[2],
                    ],
                    [
                         controlPoints[controlPoints.length - 4],
                         controlPoints[controlPoints.length - 4].clone().add((
                              controlPoints[controlPoints.length - 3].clone().sub(
                                   controlPoints[controlPoints.length - 4])
                         ).multiplyScalar(1 / b.value)),
                         extraPoints[3].clone().add((extraPoints[3].clone().sub(
                              extraPoints[2])).multiplyScalar(-1 / (1 - b.value))),
                         extraPoints[3],
                    ]
               ];
               var leftJunctionPoints = [];
               var rightJunctionPoints = [];
               for (var pointSet of characteristicPoints) {
                    var algorithm = new HAPPAH.DeCasteljauAlgorithm(pointSet, b);
                    var front = [];
                    var back = [];
                    algorithm.evaluate(b.value, function(result) {
                         front.push(result[0]);
                         back.push(result[result.length - 1])
                    });
                    back = back.reverse();
                    leftJunctionPoints.push(front);
                    rightJunctionPoints.push(back);
               }

               // Create frames for c^k junktions for k in [2,4]
               // ==============================================
               for (var frameCounter = 0; frameCounter < 3; frameCounter++) {

                    var frame = new HAPPAH.Storyboard.Frame();

                    // Add characteriying points and polygon
                    for (var cp of characteristicPoints[frameCounter]) {
                         var cp_imp = imp_template.clone();
                         cp_imp.position.copy(cp);
                         frame.points.add(cp_imp);
                    }

                    // Construct point coordinates for left and right curve
                    // using their original coordinates and the calculated
                    // junction points.
                    var leftPoints = [];
                    var rightPoints = [];
                    var k = 0;
                    for (var i = 0; i < controlPoints.length; i++) {
                         if (i < controlPoints.length - frameCounter - 1) {
                              leftPoints.push(controlPoints[i]);
                              rightPoints.push(extraPoints[extraPoints.length - i - 1]);
                              k = 0;
                         } else {
                              leftPoints.push(leftJunctionPoints[frameCounter][k]);
                              rightPoints.push(rightJunctionPoints[frameCounter][
                                   rightJunctionPoints[frameCounter].length - k - 1]);
                              k++;
                         }
                    }
                    rightPoints = rightPoints.reverse();

                    // Add left and right curve control polygons
                    frame.lines.push(HAPPAH.Util.insertSegmentStrip(
                         leftPoints, HAPPAH.Colors.COLOR1));
                    frame.lines.push(HAPPAH.Util.insertSegmentStrip(
                         rightPoints, HAPPAH.Colors.COLOR2));

                    // Add left and right curve
                    var leftCurve = new HAPPAH.DeCasteljauAlgorithm(
                         leftPoints, null);
                    frame.lines.push(HAPPAH.Util.insertSegmentStrip(
                         leftCurve.subdivide(4, 0.5), HAPPAH.Colors.BLACK));
                    var rightCurve = new HAPPAH.DeCasteljauAlgorithm(
                         rightPoints, null);
                    frame.lines.push(HAPPAH.Util.insertSegmentStrip(
                         rightCurve.subdivide(4, 0.5), HAPPAH.Colors.BLACK));

                    storyboard.append(frame);
               }
               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

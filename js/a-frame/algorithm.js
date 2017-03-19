//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah', '../lib/spherical-impostor', '../lib/intervalscrollbar', '../lib/util'], function($, THREE, HAPPAH, IMPOSTOR, SCROLLBAR, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_scrollbar = Symbol('scrollbar');
     var s_camera = Symbol('camera');
     var s_colors = Symbol('colors');
     var s_color = Symbol('color');
     var s_handles = Symbol('handles');

     class Algorithm {

          /** Default constructor. */
          constructor(controlPoints, viewport, camera) {
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_scrollbar] = new SCROLLBAR.IntervalScrollbar(new THREE.Vector3(0, -(1 / 1.2), 0), viewport, 0.2);
               this[s_scrollbar].listenTo(viewport.renderer.domElement);
               viewport.overlay.add(this[s_scrollbar]);
               this[s_camera] = camera;
               this[s_handles] = [];
          }

          /**
           * Returns the intermediate point (vector) between two points a, b
           * with distance from a set to |b-a|*ratio
           */
          interPointByRatio(a, b, ratio) {
               // The direction is b - a
               var direction = new THREE.Vector3().subVectors(b, a);

               // Start point were we want to add the direction
               var startPoint = a.clone();

               // Add the scaled direction (scale factor defined by ratio)
               return startPoint.add(direction.multiplyScalar(ratio));
          }

          subdivide(points, ratio) {
               var newPoints = [];
               // Iterate over points
               for (var i = 0; i < points.length - 1; i++) {
                    // Get the new point between point i and i+1
                    newPoints.push(this.interPointByRatio(points[i], points[i + 1], ratio));
               }
               return newPoints;
          }

          evaluate(scrollbar) {
               // TODO remove control points from pointMatrix.
               var pointMatrix = [this[s_controlPoints].slice()];

               // Get the first iteration
               var newPoints = this.subdivide(this[s_controlPoints], this[s_scrollbar].valueOf(scrollbar));

               pointMatrix.push(newPoints);

               // Iterate over the new points and repeat
               //var interPoints = this.subdivide(this[s_controlPoints], this[s_scrollbar].valueOf(1));

               //pointMatrix.push(interPoints);


               return pointMatrix;
          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               // Create the first frame by hand
               var storyboard = new HAPPAH.Storyboard(this);
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.points = new THREE.Object3D();
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_controlPoints].length < 3) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    storyboard.index = 0;
                    return storyboard;
               }
               frame0.lines[0] = UTIL.Util.insertSegmentStrip(this[s_controlPoints], 0xff0000);
               //         O
               //        , ,            |
               //       ,   + <-        v
               //      ,     ,       O--+-------1
               //  -> +       ,
               //    ,         ,
               //   O           O
               var pointMatrixLeft = this.evaluate(0);
               //         O
               //        , ,
               //    -> +   ,                |
               //      ,     ,               v
               //     ,       + <-   O-------+--1
               //    ,         ,
               //   O           O
               var pointMatrixRight = this.evaluate(1);

               // Helper points settings here
               var color = 0x54334f;
               var radius = 3;
               var template = new IMPOSTOR.SphericalImpostor(radius);
               template.material.uniforms.diffuse.value.set(color);


               // 0        1
               // O########O--------O--------O
               var segment1 = [pointMatrixLeft[0][0], pointMatrixLeft[1][0]];
               //          0        1
               // O--------O########O--------O
               var segment2 = [pointMatrixLeft[1][0], pointMatrixRight[1][0]];
               //                   0        1
               // O--------O--------O########O
               var segment3 = [pointMatrixRight[1][0], pointMatrixLeft[0][1]];
               // 0        1
               // O########O--------O--------O
               var segment4 = [pointMatrixLeft[0][1], pointMatrixLeft[1][1]];
               //          0        1
               // O--------O########O--------O
               var segment5 = [pointMatrixLeft[1][1], pointMatrixRight[1][1]];
               //                   0        1
               // O--------O--------O########O
               var segment6 = [pointMatrixRight[1][1], pointMatrixLeft[0][2]];

               var frame1 = new HAPPAH.Storyboard.Frame();
               frame1.lines.push(UTIL.Util.insertSegmentStrip(segment1, HAPPAH.Colors.COLOR1));
               frame1.lines.push(UTIL.Util.insertSegmentStrip(segment2, HAPPAH.Colors.COLOR2));
               frame1.lines.push(UTIL.Util.insertSegmentStrip(segment3, HAPPAH.Colors.COLOR3));

               frame1.lines.push(UTIL.Util.insertSegmentStrip(segment4, HAPPAH.Colors.COLOR1));
               frame1.lines.push(UTIL.Util.insertSegmentStrip(segment5, HAPPAH.Colors.COLOR2));
               frame1.lines.push(UTIL.Util.insertSegmentStrip(segment6, HAPPAH.Colors.COLOR3));

               var points = segment2.concat(segment5);
               for (var i = 0; i < points.length; i++) {
                    var imp = template.clone();
                    imp.position.copy(points[i]);
                    frame1.points.add(imp);
               }
               storyboard.append(frame1);

               // Second iteration segments
               var leftInterpoint1 = this.interPointByRatio(pointMatrixLeft[1][0], pointMatrixLeft[1][1], this[s_scrollbar].valueOf(0));
               var leftInterpoint2 = this.interPointByRatio(pointMatrixLeft[1][0], pointMatrixLeft[1][1], this[s_scrollbar].valueOf(1));

               var rightInterpoint1 = this.interPointByRatio(pointMatrixRight[1][0], pointMatrixRight[1][1], this[s_scrollbar].valueOf(0));
               var rightInterpoint2 = this.interPointByRatio(pointMatrixRight[1][0], pointMatrixRight[1][1], this[s_scrollbar].valueOf(1));

               // 0        1
               // O########O--------O--------O
               var segment1 = [pointMatrixLeft[1][0], leftInterpoint1];
               //          0        1
               // O--------O########O--------O
               var segment2 = [leftInterpoint1, leftInterpoint2];
               //                   0        1
               // O--------O--------O########O
               var segment3 = [leftInterpoint2, pointMatrixLeft[1][1]];
               // 0        1
               // O########O--------O--------O
               var segment4 = [pointMatrixRight[1][0], rightInterpoint1];
               //          0        1
               // O--------O########O--------O
               var segment5 = [rightInterpoint1, rightInterpoint2];
               //                   0        1
               // O--------O--------O########O
               var segment6 = [rightInterpoint2, pointMatrixRight[1][1]];
               //          v
               // O--------O--------O--------O
               var frame2 = frame1.clone();
               var imp = template.clone();
               imp.position.copy(this.interPointByRatio(pointMatrixLeft[1][0], pointMatrixLeft[1][1], this[s_scrollbar].valueOf(1)));
               frame2.points.add(imp);

               frame2.lines.push(UTIL.Util.insertSegmentStrip(segment1, HAPPAH.Colors.COLOR1));
               frame2.lines.push(UTIL.Util.insertSegmentStrip(segment2, HAPPAH.Colors.COLOR2));
               frame2.lines.push(UTIL.Util.insertSegmentStrip(segment3, HAPPAH.Colors.COLOR3));

               frame2.lines.push(UTIL.Util.insertSegmentStrip(segment4, HAPPAH.Colors.COLOR1));
               frame2.lines.push(UTIL.Util.insertSegmentStrip(segment5, HAPPAH.Colors.COLOR2));
               frame2.lines.push(UTIL.Util.insertSegmentStrip(segment6, HAPPAH.Colors.COLOR3));

               storyboard.append(frame2);

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

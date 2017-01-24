//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'lib/happah', 'lib/spherical-impostor', 'lib/util'], function($, THREE, HAPPAH, IMPOSTOR, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_scrollbar = Symbol('scrollbar');
     var s_camera = Symbol('camera');
     var s_colors = Symbol('colors');
     var s_color = Symbol('color');
     var s_handles = Symbol('handles');

     class Algorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar, camera) {
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_scrollbar] = scrollbar;
               this[s_camera] = camera;
               this[s_handles] = [];
          }

          /**
           * Set scrollbar
           */
          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
               this[s_handles] = scrollbar.handles;

               // We need an extra handle (TODO: this does not belong here)
               this[s_handles].push(this[s_scrollbar].addHandle(0.8, 0x33dd55));
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
               frame0.lines[0] = UTIL.Util.insertSegmentStrip(this[s_controlPoints], 0xff0000);
               frame0.points = new THREE.Object3D();
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    return storyboard;
               }
               // TODO: display warning if amount of controlpoints exceeds a
               //       certain level

               var pointMatrixLeft = this.evaluate(0);
               var pointMatrixRight = this.evaluate(1);

               // Helper points settings here
               var color = 0x54334f;
               var radius = 3;
               var template = new IMPOSTOR.SphericalImpostor(radius);
               var colors = [0x54334f, 0x00ff00, 0x0000ff];

               var frame = frame0.clone();
               frame.lines = [];
               for (var k = 0; k < pointMatrixLeft[1].length; k++) {
                    // From start to inter-point 1
                    var segment1 = [pointMatrixLeft[0][k].clone(), pointMatrixLeft[1][k].clone()];
                    frame.lines.push(UTIL.Util.insertSegmentStrip(segment1, colors[0]));

                    // From inter-point 1 to inter-point 2
                    var segment2 = [pointMatrixLeft[1][k].clone(), pointMatrixRight[1][k].clone()];
                    frame.lines.push(UTIL.Util.insertSegmentStrip(segment2, colors[1]));

                    // From inter-point 2 to end
                    var segment3 = [pointMatrixRight[1][k].clone(), pointMatrixLeft[0][k + 1].clone()];
                    frame.lines.push(UTIL.Util.insertSegmentStrip(segment3, colors[2]));

                    // Impostors
                    var imp = template.clone();
                    imp.position.copy(pointMatrixLeft[1][k]);
                    imp.material.uniforms.diffuse.value.set(color);
                    frame.points.add(imp);

                    var imp2 = template.clone();
                    imp2.position.copy(pointMatrixRight[1][k]);
                    imp2.material.uniforms.diffuse.value.set(color);
                    frame.points.add(imp2);
               }
               storyboard.append(frame);

               // Frame for second iteration segment strips
               var frame2 = frame.clone();

               for (var k = 0; k < pointMatrixLeft[1].length - 1; k++) {
                    // Left
                    var segment1 = [pointMatrixLeft[1][k], pointMatrixLeft[1][k + 1]];
                    frame2.lines.push(UTIL.Util.insertSegmentStrip(segment1, colors[0]));

                    // Right
                    var segment2 = [pointMatrixRight[1][k], pointMatrixRight[1][k + 1]];
                    frame2.lines.push(UTIL.Util.insertSegmentStrip(segment2, colors[0]));

                    // Also add intersection point to the frame
                    // FIXME: this is restricted to two scrollbar handles
                    var point = this.interPointByRatio(pointMatrixLeft[1][k], pointMatrixLeft[1][k + 1], this[s_scrollbar].valueOf(1));

                    var imp = template.clone();
                    imp.position.copy(point);
                    imp.material.uniforms.diffuse.value.set(colors[0]);
                    frame2.points.add(imp);
               }
               storyboard.append(frame2);

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

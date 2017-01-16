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

          evaluate() {
               var pointMatrix = [];
               for (var k = 0; k < this[s_controlPoints].length - 1; k++) {
                    var newPoints = [];
                    // Iterate over controlpoints
                    for (var i = 0; i < this[s_controlPoints].length - 1; i++) {
                         // Get the new point between point i and i+1
                         newPoints.push(this.interPointByRatio(this[s_controlPoints][i], this[s_controlPoints][i + 1], this[s_scrollbar].valueOf(k)));
                    }
                    pointMatrix.push(newPoints);
                    var interPoints = [];

                    // Iterate over the new points and repeat
                    for (var i = 0; i < newPoints.length - 1; i++) {
                         var tmppoint = this.interPointByRatio(newPoints[i], newPoints[i + 1], this[s_scrollbar].valueOf(k + 1));
                         interPoints.push(tmppoint);
                    }
                    pointMatrix.push(interPoints);
               }
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

               var pointMatrix = this.evaluate();

               // Helper points settings here
               var color = 0x54334f;
               var radius = 3;
               var template = new IMPOSTOR.SphericalImpostor(radius);

               // Iterate over scrollbar and add polygon each iteration
               for (var i = 0; i < pointMatrix.length - 1; i++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step: " + i;

                    for (var k in pointMatrix[i]) {
                         var imp = template.clone();
                         imp.position.copy(pointMatrix[i][k]);
                         imp.material.uniforms.diffuse.value.set(color);
                         frame.points.add(imp);
                    }

                    if (this[s_handles][i] != null) {
                         frame.lines.push(UTIL.Util.insertSegmentStrip(pointMatrix[i], this[s_handles][i].material.color));
                    }

                    // Include lines and points from previous iterations
                    frame.lines = frame.lines.concat(storyboard.lastFrame().lines);
                    //storyboard.lastFrame().points.children.concat(frame.points.children);
                    frame.points.children = frame.points.children.concat(storyboard.lastFrame().points.children);
                    storyboard.append(frame);
               }

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

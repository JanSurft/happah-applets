//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'lib/happah', 'lib/spherical-impostor', 'lib/util'], function($, THREE, HAPPAH, IMPOSTOR, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');
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
               this[s_ratio] = (scrollbar == null) ? 0.5 : scrollbar.value;
               this[s_scrollbar] = scrollbar;
               this[s_camera] = camera;
               this[s_color] = 0xE50A00;
               this[s_handles] = [];

               // Initial color
               this[s_colors] = [0xFF0000];
          }

          /**
           * Set scrollbar
           */
          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
               this[s_handles] = scrollbar.handles;
          }

          evaluate() {
               var pointMatrix = [];
               var interPoints = [];
               for (var k = 0; k < this[s_controlPoints].length - 1; k++) {
                    var newPoints = [];
                    // Iterate over controlpoints
                    for (var i = 0; i < this[s_controlPoints].length - 1; i++) {
                         var newPoint = new THREE.Vector3();
                         var startPoint = this[s_controlPoints][i].clone();
                         var endPoint = this[s_controlPoints][i + 1].clone();
                         startPoint.multiplyScalar(1 - this[s_scrollbar].valueOf(k));
                         endPoint.multiplyScalar(this[s_scrollbar].valueOf(k));
                         newPoint.addVectors(startPoint, endPoint);

                         // A new point with ratio of scrollbar k.
                         newPoints.push(newPoint);
                    }
                    pointMatrix.push(newPoints);

                    for (var i = 0; i < newPoints.length - 1; i++) {
                         var newPoint = new THREE.Vector3();
                         var startPoint = newPoints[i].clone();
                         var endPoint = newPoints[i + 1].clone();
                         startPoint.multiplyScalar(1 - this[s_scrollbar].valueOf(k + 1));
                         endPoint.multiplyScalar(this[s_scrollbar].valueOf(k + 1));
                         newPoint.addVectors(startPoint, endPoint);

                         interPoints.push(newPoint);
                    }
                    //pointMatrix.push(interPoints);
               }
               pointMatrix.push(interPoints);
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

               // Update handles
               for (var i = 0; i < this[s_controlPoints].length - 1; i++) {
                    if (this[s_handles][i] == null) {
                         this[s_color] += 0x0E5034;
                         this[s_handles].push(this[s_scrollbar].addHandle(0.5, this[s_color]));
                    }
               }

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
                    } else {
                         console.log("handle undefined" + i);
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

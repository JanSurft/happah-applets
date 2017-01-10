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
          }

          evaluate() {

               var pointMatrix = [];
               for (var k in this[s_controlPoints]) {
                    var newPoints = [];
                    // Iterate over controlpoints
                    for (var i = 0; i < this[s_controlPoints].length - 1; i++) {
                         var newPoint = new THREE.Vector3();
                         var startPoint = this[s_controlPoints][i].clone();
                         var endPoint = this[s_controlPoints][i + 1].clone();
                         startPoint.multiplyScalar(1 - this[s_scrollbar].valueOf(k));
                         endPoint.multiplyScalar(this[s_scrollbar].valueOf(k));
                         newPoint.addVectors(startPoint, endPoint);

                         newPoints.push(newPoint);
                    }
                    pointMatrix.push(newPoints);

                    // Create intersection points
                    //var ray1 = new THREE.Ray(pointMatrix[k - 1][0], pointMatrix[k - 1][1]);
                    //var ray2 = new THREE.Ray(pointMatrix[k][0], pointMatrix[k][1]);
                    var startPoint = pointMatrix[k][0].clone();
                    var endPoint = pointMatrix[k][1].clone();
                    startPoint.multiplyScalar(1 - this[s_scrollbar].valueOf(k));
                    endPoint.multiplyScalar(this[s_scrollbar].valueOf(k));

                    pointMatrix.push([new THREE.Vector3().addVectors(startPoint, endPoint)]);


               }
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
                    if (this[s_handles][i] != null) {
                         //this[s_handles][i].position.x = (0.5 / 150) + 0.5;
                    } else {
                         this[s_color] += 0x0E5034;
                         this[s_handles].push(this[s_scrollbar].addHandle(0.5, this[s_color]));
                    }
               }

               //var pointMatrix = this.evaluate(function() {});
               var pointMatrix = this.evaluate();

               // Helper points settings here
               var color = 0x54334f;
               var radius = 3;
               var template = new IMPOSTOR.SphericalImpostor(radius);

               // Iterate over scrollbar and add polygon each iteration
               for (var i = 1; i < pointMatrix.length; i++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step: " + i;

                    for (var k in pointMatrix[i]) {
                         var imp = template.clone();
                         imp.position.copy(pointMatrix[i][k]);
                         imp.material.uniforms.diffuse.value.set(color);
                         frame.points.add(imp);
                    }

                    if (pointMatrix[i].length > 1 && this[s_handles][i - 1] != null) {
                         frame.lines.push(UTIL.Util.insertSegmentStrip(pointMatrix[i], this[s_handles][i - 1].material.color));
                    }

                    // Include lines and points from previous iterations
                    frame.lines = frame.lines.concat(storyboard.lastFrame().lines);
                    storyboard.lastFrame().points.children.concat(frame.points.children);
                    storyboard.append(frame);
               }

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

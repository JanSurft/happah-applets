//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah', '../lib/spherical-impostor', '../lib/util'], function($, THREE, HAPPAH, IMPOSTOR, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_origin = Symbol('origin');
     var s_axis = Symbol('axis');
     var s_scrollbar = Symbol('scrollbar');

     class Algorithm extends HAPPAH.DeCasteljauAlgorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar, camera) {
               super(controlPoints, scrollbar);

               this[s_scrollbar] = scrollbar;
               this[s_controlPoints] = controlPoints;
               this[s_origin] = new THREE.Vector3(40, 0, 0);
               this[s_axis] = new THREE.Vector3(1, 0, 0);
          }

          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               var storyboard = new HAPPAH.Storyboard(this);

               // Default control polygon frame
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.lines.push(UTIL.Util.insertSegmentStrip(this[s_controlPoints], 0xff0000));
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_scrollbar] == null || this[s_controlPoints] == 0) {
                    frame0.lines[0] = new THREE.Object3D();
                    return storyboard;
               }

               var material = new THREE.MeshBasicMaterial({
                    color: 0x000000
               });
               // Add an arrow to the end
               var geo = new THREE.CylinderBufferGeometry(0, 4, 8, 20, 8);
               var cone_template = new THREE.Mesh(geo, material);
               cone_template.rotateZ(-Math.PI / 2);

               var points = this[s_controlPoints];

               var frame1 = frame0.clone();

               for (var i = 0; i < points.length - 1; i++) {
                    var vector = points[i + 1].clone().sub(points[i]);
                    vector.multiplyScalar(points.length - 1);
                    var vector2 = this[s_origin].clone().add(vector);

                    var line = UTIL.Util.insertSegmentStrip([this[s_origin], vector2], 0x000000);
                    var cone = cone_template.clone();

                    // Get the angle between vector and z-axis
                    var angle = this[s_axis].angleTo(vector.clone().normalize());
                    //angle = vector2.x > 0 ? angle : -angle;
                    cone.position.copy(vector2);
                    if (vector2.z < 0) {
                         cone.rotateX(2 * Math.PI - angle);
                    } else {
                         cone.rotateX(angle);
                    }

                    frame1.lines.push(line);
                    frame1.lines.push(cone);
               }
               var poly = UTIL.Util.insertSegmentStrip(this.subdivide(4, 0.5), 0x000000);
               var point = new IMPOSTOR.SphericalImpostor(3);
               point.material.uniforms.diffuse.value.set(0x333333);
               var epoints = [];
               var p = this.evaluate(this[s_scrollbar].value, function add(point) {
                    epoints.push(point);
               });
               //         O----------------O
               //        /    ../    \..    \
               //       /  ../----O-----\..  \
               //      /../                \..\
               //     //                      \\
               //    /                          \
               //   /                            \
               //  O                              O
               // Get the tangent vector
               var tangentvec = epoints[1][1].clone().sub(epoints[1][0]);

               // Move vector to point p
               tangentvec = p.clone().add(tangentvec);

               var tangent = UTIL.Util.insertSegmentStrip([p, tangentvec], 0x006600);

               // Final point to move along the curve
               point.position.copy(p);
               var axish = new THREE.AxisHelper(10);
               frame1.lines.push(poly);
               frame1.lines.push(axish);
               frame1.points.add(point);
               frame1.lines.push(tangent);
               storyboard.append(frame1);

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

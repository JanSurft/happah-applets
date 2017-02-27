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
               var geo = new THREE.CylinderBufferGeometry(0, 3, 7, 16, 7);
               var cone_template = new THREE.Mesh(geo, material);
               cone_template.rotateZ(-Math.PI / 2);

               var points = this[s_controlPoints];

               var frame1 = frame0.clone();

               var derivativepoints = [];
               for (var i = 0; i < points.length - 1; i++) {
                    var vector = points[i + 1].clone().sub(points[i]);
                    vector.multiplyScalar(points.length - 1);
                    var vector2 = this[s_origin].clone().add(vector);

                    var line = UTIL.Util.insertSegmentStrip([this[s_origin], vector2], 0x000000);
                    var cone = cone_template.clone();
                    derivativepoints.push(vector2);

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
               // Derivative curve
               var decasteljau = new HAPPAH.DeCasteljauAlgorithm(derivativepoints, this[s_scrollbar]);
               derivativepoints = decasteljau.subdivide(4, 0.5);
               frame1.lines.push(UTIL.Util.insertSegmentStrip(derivativepoints, 0x0000ff));

               var poly = UTIL.Util.insertSegmentStrip(this.subdivide(4, 0.5), 0x000000);
               var point = new IMPOSTOR.SphericalImpostor(3);
               point.material.uniforms.diffuse.value.set(0x333333);
               var epoints = [];
               var p = this.evaluate(this[s_scrollbar].value, function add(point) {
                    epoints.push(point);
               });
               //         O----------------O
               //        /    ../    \..    \
               //  ---  /  ../----O-----\..  \  ----> Tangent at O
               //      /../                \..\
               //     //                      \\
               //    /                          \
               //   /                            \
               //  O                              O
               // Get the tangent vector
               var lastseg = epoints.length - 2;
               var lastseglength = epoints[lastseg].length - 1;
               var tangentvec = epoints[lastseg][lastseglength].clone().sub(epoints[lastseg][lastseglength - 1]);
               var cone = cone_template.clone();
               var angle = this[s_axis].angleTo(tangentvec.clone().normalize());
               angle = tangentvec.z < 0 ? 2 * Math.PI - angle : angle;

               // Move vector to point p
               tangentvec = p.clone().add(tangentvec);

               cone.position.copy(tangentvec);
               cone.rotateX(angle);

               var tangent = UTIL.Util.insertSegmentStrip([p, tangentvec], 0x006600);

               // Final point to move along the curve
               point.position.copy(p);
               frame1.lines.push(poly);
               frame1.points.add(point);
               frame1.lines.push(tangent);
               frame1.lines.push(cone);
               storyboard.append(frame1);

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

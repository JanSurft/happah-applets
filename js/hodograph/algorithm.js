//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah', '../lib/spherical-impostor', '../lib/util'], function($, THREE, HAPPAH, IMPOSTOR, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_origin = Symbol('origin');

     class Algorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar, camera) {
               this[s_controlPoints] = controlPoints;
               this[s_origin] = new THREE.Vector3(10, 10, 10);
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

               if (this[s_controlPoints] == 0) {
                    frame0.lines[0] = new THREE.Object3D();
                    return storyboard;
               }

               var points = this[s_controlPoints];

               var frame1 = frame0.clone();

               for (var i = 0; i < points.length - 1; i++) {
                    var vector = points[i + 1].clone().sub(points[i]);
                    var vector2 = this[s_origin].clone().add(vector);

                    // TODO manually add segment strip, so we can add a cone on
                    // top
                    //var line = UTIL.Util.insertSegmentStrip([this[s_origin], vector2], 0x003300);

                    // Add an arrow to the end
                    var cone = new CylinderBufferGeometry(0, 0.5, 1, 5, 1);
                    var line.geometry.merge(cone);

               }
               storyboard.append(frame1);

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

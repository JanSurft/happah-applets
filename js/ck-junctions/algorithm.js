//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah', '../lib/spherical-impostor', '../lib/util'], function($, THREE, HAPPAH, IMPOSTOR, UTIL) {
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
                    new THREE.Vector3(-50, 0, 60).add(origin),
                    new THREE.Vector3(-40, 0, 0).add(origin),
                    new THREE.Vector3(40, 0, 0).add(origin),
                    new THREE.Vector3(50, 0, 60).add(origin)
               ];
          }

          /**
           * Set scrollbar
           */
          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
          }

          /**
           *
           */
          extraPointByRatio(a, b, ratio) {
               if (a == b) {
                    return a.clone();
               }
               // The direction is b - a
               var direction = new THREE.Vector3().subVectors(b, a);

               // Start point were we want to add the direction
               var startPoint = a.clone();

               // Add the scaled direction (scale factor defined by 1 / ratio)
               return startPoint.add(direction.multiplyScalar(1 / ratio));
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
               frame0.lines.push(UTIL.Util.insertSegmentStrip(controlPoints, 0xff0000));
               frame0.lines.push(UTIL.Util.insertSegmentStrip(extraPoints, 0xff0000));
               storyboard.append(frame0);
               var imp_template = new IMPOSTOR.SphericalImpostor(3);
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

               // First frame goes here:
               //     O-------O
               //    /         \
               //   /           \             O   3
               //  /          0  O <-C^0     /
               // O              |          /
               //                |         /
               //             1  O--------O   2

               var geometry = new THREE.Geometry();
               geometry.vertices = [
                    controlPoints[controlPoints.length - 2],
                    controlPoints[controlPoints.length - 1],
                    extraPoints[0],
                    extraPoints[1]
               ];

               for (var k = 0; k < 3; k++) {
                    // Keep the controlpolygon and segment strips
                    var frame = new HAPPAH.Storyboard.Frame();

                    var points = [];
                    for (var i = 0; i < controlPoints.length; i++) {
                         points.push(controlPoints[i]);
                    }

                    // Last point of controlpolygon is joint point
                    for (var i = 0; i < k; i++) {
                         extraPoints[i].copy(this.extraPointByRatio(controlPoints[controlPoints.length - 1 - k],
                              controlPoints[controlPoints.length - 1], this[s_scrollbar].value));
                    }

                    for (var i = 1; i < extraPoints.length; i++) {
                         points.push(extraPoints[i]);
                         var imp = imp_template.clone();
                         imp.position.copy(extraPoints[i]);
                         frame.points.add(imp);
                    }
                    frame.lines.push(UTIL.Util.insertSegmentStrip(points, 0xff0000));
                    storyboard.append(frame);
               }

               //var frame2 = frame1.clone(); //new HAPPAH.Storyboard.Frame();
               //// TODO: make this an algorithm
               //var imp = imp_template.clone();
               //imp.position.copy(this.extraPointByRatio(controlPoints[2],
               //controlPoints[3], this[s_scrollbar].value));
               //frame2.points.add(imp);
               //storyboard.append(frame2);


               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

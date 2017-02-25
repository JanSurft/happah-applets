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
               // The direction is b - a
               var direction = new THREE.Vector3().subVectors(b, a);

               // Start point were we want to add the direction
               var startPoint = b.clone();

               // Add the scaled direction (scale factor defined by 1 / ratio)
               return startPoint.add(direction.multiplyScalar(1 / ratio));
          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               // Create the first frame by hand
               var storyboard = new HAPPAH.Storyboard(this);
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.title = "Controlpolygon";
               frame0.lines.push(UTIL.Util.insertSegmentStrip(this[s_controlPoints], 0xff0000));
               frame0.lines.push(UTIL.Util.insertSegmentStrip(this[s_extraPoints], 0xff0000));
               storyboard.append(frame0);
               var imp_template = new IMPOSTOR.SphericalImpostor(3);
               imp_template.material.uniforms.diffuse.value.set(0x00ff00);

               for (var i of this[s_extraPoints]) {
                    var imp = imp_template.clone();
                    imp.position.copy(i);
                    frame0.points.add(imp);
               }

               if (this[s_controlPoints].length < 3) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    storyboard.index = 0;
                    return storyboard;
               }

               // First frame goes here:
               //     O-------O
               //    /         \
               //   /           \             O
               //  /             O <-C^0     /
               // O              |          /
               //                |         /
               //                O--------O
               var frame1 = new HAPPAH.Storyboard.Frame();
               var k = 0;
               var points = [];

               var geometry = new THREE.Geometry();
               geometry.vertices = [
                    this[s_controlPoints][this[s_controlPoints].length - 2],
                    this[s_controlPoints][this[s_controlPoints].length - 1],
                    this[s_extraPoints][0],
                    this[s_extraPoints][1]
               ];
               // We move the controlpoint
               var joint = this[s_controlPoints][this[s_controlPoints].length - 1];

               for (var i = 0; i < this[s_controlPoints].length; i++) {
                    points.push(this[s_controlPoints][i]);
                    //var imp = imp_template.clone();
                    //imp.position.copy(this[s_controlPoints][i]);
                    //frame1.points.add(imp);
               }

               //var imp = imp_template.clone();
               //imp.position.copy(joint);
               //frame1.points.add(imp);

               for (var i = 1; i < this[s_extraPoints].length; i++) {
                    points.push(this[s_extraPoints][i]);
                    var imp = imp_template.clone();
                    imp.position.copy(this[s_extraPoints][i]);
                    frame1.points.add(imp);
               }
               frame1.lines.push(UTIL.Util.insertSegmentStrip(points, 0xff0000));
               storyboard.append(frame1);

               var frame2 = new HAPPAH.Storyboard.Frame();
               // TODO: make this an algorithm
               //var frame2.points.push(this.extraPointByRatio(


               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
// Algorithm for app 'linear precision'
//
// Let n points be equally distributed on a straight line. After applying the
// de'Casteljau algorithm on this control polygon, the last added point will
// divide the start point s and the end point e in the ratio t:(1-t).
// Let t be 2/3
//                          p=te+(1-t)s
//      *-----------------------*-----------*
//     (s)                      :          (e)
//                      *-------.===*
//                      :           :
//              *-------.===*-------.===*
//              :           :           :
//      *-------.===*-------.===*-------.===*
//     (s)                                 (e)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', '../lib/happah', '../lib/spherical-impostor', '../lib/util'], function($, THREE, HAPPAH, IMPOSTOR, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');
     var s_scrollbar = Symbol('scrollbar');

     class Algorithm extends HAPPAH.DeCasteljauAlgorithm {

          /** Default constructor. */
          constructor(controlPoints, scrollbar) {
               super(controlPoints, scrollbar);
               this.storyboard = this.storyboard.bind(this);
               this[s_controlPoints] = controlPoints;
               this[s_ratio] = (scrollbar == null) ? 0.5 : scrollbar.value;
               this[s_scrollbar] = scrollbar;
          }

          // we need this, because scrolbar gets set after the constructor call
          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
               super.scrollbar = scrollbar;
          }

          /**
           * Returns a storyboard with frames that contain the different steps
           * of the algorithm
           */
          storyboard() {
               var ratio;
               if (this[s_scrollbar] == null) {
                    ratio = 0.5;
               } else {
                    ratio = this[s_scrollbar].value;
               }

               // evaluate all de Casteljau steps and store their result in a
               // point matrix
               var pointMatrix = new Array();
               pointMatrix.push(this[s_controlPoints]);
               this.evaluate(ratio, function add(points) {
                    pointMatrix.push(points);
               });

               // impostor templates only need to created once
               var radius = 3;
               var imp_template = new IMPOSTOR.SphericalImpostor(radius);
               imp_template.material.uniforms.diffuse.value.set(HAPPAH.Colors.COLOR2);
               var imp_template_emph = new IMPOSTOR.SphericalImpostor(radius);
               imp_template_emph.material.uniforms.diffuse.value.set(
                    HAPPAH.Colors.COLOR4);

               var storyboard = new HAPPAH.Storyboard(this);
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.lines[0] = UTIL.Util.insertSegmentStrip(this[s_controlPoints], 0xff0000);
               frame0.title = "Controlpolygon";
               frame0.points = new THREE.Object3D();
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    return storyboard;
               }

               var substrips = [];
               substrips.push([this[s_controlPoints]]);

               for (var i=0; i < 5; i++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    substrips.push([]);
                    for (var pointArray of substrips[i]) {
                         var temp = new HAPPAH.DeCasteljauAlgorithm(pointArray);
                         var right = temp.subdivide(1, ratio);
                         var left = right.splice(0, Math.floor(right.length / 2));
                         left.push(right[0].clone());
                         substrips[i+1].push(left);
                         substrips[i+1].push(right);
                         frame.lines.push(UTIL.Util.insertSegmentStrip(
                              left, HAPPAH.Colors.COLOR1));
                         frame.lines.push(UTIL.Util.insertSegmentStrip(
                              right, HAPPAH.Colors.GREY));
                    }
                    storyboard.append(frame);
               }

               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

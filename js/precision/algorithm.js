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

               var storyboard = new HAPPAH.Storyboard(this);

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

               var frame0 = new HAPPAH.Storyboard.Frame();
               for (var i in pointMatrix[0]) {
                    frame0.points = new THREE.Object3D();
                    var point = pointMatrix[0][i].clone();
                    var imp = imp_template.clone();
                    imp.position.copy(point);
                    frame0.points.add(imp);
                    if (i < pointMatrix[0].length - 1) {
                         var nextPoint = pointMatrix[0][++i].clone();
                         var segment = [point, nextPoint];
                         var strip = UTIL.Util.insertSegmentStrip(
                              segment, HAPPAH.Colors.GREY);
                         frame0.lines.push(strip);
                    }
               }

               // The baseFrame contains all frame parts also present in future
               // frames. Cloning and extending them is more efficient than
               // generating each frame completely separately.
               var baseFrame = frame0.clone();
               storyboard.append(frame0);
               baseFrame.lines = [];
               var offset = 0;

               for (var frameIndex = 0; frameIndex < pointMatrix.length - 1; frameIndex++) {
                    var frame = baseFrame.clone();
                    for (var i = 0; i < pointMatrix[frameIndex + 1].length; i++) {

                         var point = pointMatrix[frameIndex + 1][i].clone();
                         point.y += offset;

                         var imp_emph = imp_template_emph.clone();
                         imp_emph.position.copy(point);
                         frame.points.add(imp_emph);

                         var imp = imp_template.clone();
                         imp.position.copy(point);
                         baseFrame.points.add(imp);

                         var prev = pointMatrix[frameIndex][i].clone();
                         prev.y += offset;
                         var segment = [prev, point];
                         frame.lines.push(UTIL.Util.insertSegmentStrip(
                              segment, HAPPAH.Colors.BLACK));
                         baseFrame.lines.push(UTIL.Util.insertSegmentStrip(
                              segment, HAPPAH.Colors.GREY));

                         var next = pointMatrix[frameIndex][i + 1].clone();
                         next.y += offset;
                         var segment2 = [point, next];
                         frame.lines.push(UTIL.Util.insertSegmentStrip(
                              segment2, HAPPAH.Colors.COLOR1));
                         baseFrame.lines.push(UTIL.Util.insertSegmentStrip(
                              segment2, HAPPAH.Colors.COLOR1_LIGHTEST));
                    }
                    storyboard.append(frame);
                    offset += 10;

                    var upshiftFrame = baseFrame.clone();
                    for (var i = 0; i < pointMatrix[frameIndex + 1].length; i++) {
                         var point = pointMatrix[frameIndex + 1][i].clone();
                         point.y += offset;

                         var imp_emph = imp_template_emph.clone();
                         imp_emph.position.copy(point);
                         upshiftFrame.points.add(imp_emph);

                         var imp = imp_template.clone();
                         imp.position.copy(point);
                         baseFrame.points.add(imp);

                         var imp

                         if (i < pointMatrix[frameIndex + 1].length - 1) {
                              var nextPoint = pointMatrix[
                                   frameIndex + 1][i + 1].clone();
                              nextPoint.y += offset;
                              var segment = [point, nextPoint];
                              upshiftFrame.lines.push(
                                   UTIL.Util.insertSegmentStrip(segment,
                                        HAPPAH.Colors.COLOR4_LIGHTEST));
                         }
                    }
                    storyboard.append(upshiftFrame);
               }
               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

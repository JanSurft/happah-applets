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
//                      *-------.---*
//                      :           :
//              *-------.---*-------.---*
//              :           :           :
//      *-------.---*-------.---*-------.---*
//     (s)                                 (e)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', 'lib/happah', 'lib/spherical-impostor', 'lib/util'], function($, THREE, HAPPAH, IMPOSTOR, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');
     var s_scrollbar = Symbol('scrollbar');
     const IMPOSTOR_COLOR = 0x888888;
     const IMPOSTOR_COLOR_EMPH = 0xFFFFFF;
     const LINE_COLOR = 0x888888;
     const LINE_COLOR_EMPH = 0xFF0000;

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

               // Point settings
               var radius = 3;
               var color = 0x3d3d3d;
               var template = new IMPOSTOR.SphericalImpostor(radius);

               for (var currentFrame = 0; currentFrame < pointMatrix.length; currentFrame++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    var offset = 0;
                    for (var row = 0; row <= currentFrame; row++) {
                         for (var i in pointMatrix[row]) {
                              var point = pointMatrix[row][i].clone();
                              point.y += offset;

                              // Impostors from here
                              frame.points = new THREE.Object3D();
                              var imp = template.clone();
                              imp.position.copy(point);
                              imp.material.uniforms.diffuse.value.set(color);
                              frame.points.add(imp);
                         }
                         // draw each newly generated line with an emphasized
                         // color, for example red
                         if (row == currentFrame && currentFrame != pointMatrix.length - 1) {
                              var start = pointMatrix[row][0].clone();
                              start.y += offset;
                              var end = pointMatrix[row][pointMatrix[row].length - 1].clone();
                              end.y += offset;
                              var segment = [start, end];
                              var strip = UTIL.Util.insertSegmentStrip(segment, LINE_COLOR_EMPH);
                              frame.lines.push(strip);
                              // draw lines from previous steps with another color
                         } else if (row < currentFrame) {
                              var start = pointMatrix[row][0].clone();
                              start.y += offset;
                              var end = pointMatrix[row][pointMatrix[row].length - 1].clone();
                              end.y += offset;
                              var segment = [start, end];
                              var strip = UTIL.Util.insertSegmentStrip(segment, LINE_COLOR);
                              frame.lines.push(strip);
                         }
                         offset += 10;
                    }
                    offset -= 10;
                    storyboard.append(frame);

                    // add an additional frame where the new points are on the
                    // previous lines
                    if (currentFrame != pointMatrix.length - 1) {
                         var midFrame = frame.clone();
                         for (var i in pointMatrix[currentFrame + 1]) {
                              var pointCopy = pointMatrix[currentFrame + 1][i].clone();
                              pointCopy.y += offset;

                              // Make point to impostor
                              midFrame.points = new THREE.Object3D();
                              var imp = template.clone();
                              imp.position.copy(pointCopy);
                              imp.material.uniforms.diffuse.value.set(color);
                              midFrame.points.add(imp);
                         }
                         storyboard.append(midFrame);
                    }
               }
               return storyboard;
          }
     }

     return {
          Algorithm: Algorithm
     };
});

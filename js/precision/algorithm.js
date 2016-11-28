//////////////////////////////////////////////////////////////////////////////
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
//      *-------.---*-------.---*-------.---* Step 0
//     (s)                                 (e)
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', 'lib/happah', 'lib/util'], function($, THREE, HAPPAH, UTIL) {
     var s_controlPoints = Symbol('controlPoints');
     var s_ratio = Symbol('ratio');
     var s_scrollbar = Symbol('scrollbar');
     const EMPH_COLOR = 0xFF0000;
     const LINE_COLOR = 0x888888;

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

               for (var currentFrame = 0; currentFrame < pointMatrix.length; currentFrame++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    var offset = 0;
                    for (var row = 0; row <= currentFrame; row++) {
                         for (var i in pointMatrix[row]) {
                              var point = pointMatrix[row][i].clone();
                              point.y += offset;
                              frame.points.push(point);
                         }
                         // draw each newly generated line with an emphasized
                         // color, for example red
                         if (row == currentFrame && currentFrame != pointMatrix.length - 1) {
                              var start = pointMatrix[row][0].clone();
                              start.y += offset;
                              var end = pointMatrix[row][pointMatrix[row].length - 1].clone();
                              end.y += offset;
                              var segment = [start, end];
                              var strip = UTIL.Util.insertSegmentStrip(segment, EMPH_COLOR);
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
                              midFrame.points.push(pointCopy);
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

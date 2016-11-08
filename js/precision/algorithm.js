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

define(['jquery', 'three', 'lib/happah'], function($, THREE, HAPPAH) {
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
               // Create the first frame by hand
               var storyboard = new HAPPAH.Storyboard(this);
               var frame0 = new HAPPAH.Storyboard.Frame();
               frame0.lines[0] = insertSegmentStrip(this[s_controlPoints], 0xff0000);
               frame0.title = "Controlpolygon";
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    return storyboard;
               }

               // each iteration step gets stored in a matrix row
               var pointMatrix = new Array();

               // First set of points is the control polygon
               pointMatrix.push(this[s_controlPoints]);

               // fill matrix with points from each iteration
               this.evaluate(ratio, function add(points) {
                    pointMatrix.push(points);
               });

               var redSegments = [];
               var blackSegments = [];
               var impostorPoints = [];

               for (var frameIndex = 1; frameIndex < pointMatrix.length; frameIndex++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    var offset = 20;
                    for (var row = 1; row <= frameIndex; row++) {
                         for (var i in pointMatrix[row]) {
                              var point = pointMatrix[row][i].clone();
                              point.y += offset;
                              frame.points.push(point);
                         }
                         if (row == frameIndex && frameIndex != pointMatrix.length - 1) {
                              //for (var i = 0; i < pointMatrix[row].length - 1; i++) {
                              var start = pointMatrix[row][0].clone();
                              start.y += offset;
                              var end = pointMatrix[row][pointMatrix[row].length - 1].clone();
                              end.y += offset;
                              var segment = new Array();
                              segment.push(start);
                              segment.push(end);
                              var segment = [start, end];
                              var strip = insertSegmentStrip(segment, 0xFF0000);
                              frame.lines.push(strip);
                              //}
                         }
                         offset += 20;
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

//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
// De Casteljau's algorithm with polar form labels, showing the ratios for the
// current point.
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah', '../lib/spherical-impostor', '../lib/scrollbar', '../lib/util', '../lib/colors'], function($, THREE, HAPPAH, IMPOSTOR, SCROLLBAR, UTIL, COLORS) {

     var s_controlPoints = Symbol('controlpoints');
     var s_scrollbar = Symbol('scrollbar');
     var s_labelmanager = Symbol('labelmanager');

     class Algorithm extends HAPPAH.DeCasteljauAlgorithm {

          constructor(controlPoints, scrollbar) {
               super(controlPoints, scrollbar);
               this.storyboard = this.storyboard.bind(this);

               this[s_scrollbar] = scrollbar;
               this[s_controlPoints] = controlPoints;
          }

          set labelmanager(labelmanager) {
               this[s_labelmanager] = labelmanager;
          }

          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
               let handle = this[s_scrollbar].getHandle();
               handle.geometry.scale(0.75, 1, 1);
               this[s_labelmanager].addLabel("C", handle, "interval", true);
          }

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
               frame0.lines[0] = UTIL.Util.insertSegmentStrip(this[s_controlPoints], COLORS.Colors.RED);
               frame0.title = "Controlpolygon";
               frame0.points = new THREE.Object3D();
               storyboard.append(frame0);

               if (this[s_controlPoints].length == 0) {
                    // Add a dummy mesh
                    frame0.lines[0] = new THREE.Object3D();
                    return storyboard;
               }

               // matrix of points for every iteration
               var pointMatrix = new Array();

               //pointMatrix = this.evaluate(function() {});
               pointMatrix.push(this[s_controlPoints]);
               this.evaluate(ratio, function add(points) {
                    pointMatrix.push(points);
               });

               // Helper points radius
               var radius = 3;
               var color = COLORS.Colors.GREY;

               frame0.points = new THREE.Object3D();

               this[s_labelmanager].removeLabelsByTag("pts");

               for (let k = 0; k < this[s_controlPoints].length; k++) {
                    var str = "";

                    for (var m = 0; m < this[s_controlPoints].length - k - 1; m++) {
                         str += "0";
                    }

                    // Push previous handle's labels
                    for (let l = 0; m < this[s_controlPoints].length - 1 && k != 0; m++) {
                         str += "1";
                         l++;
                    }
                    this[s_labelmanager].addLabel("[" + str + "]", this[s_controlPoints][k], "pts", false);
               }
               // Impostor template
               var template = new IMPOSTOR.SphericalImpostor(radius);

               for (var i = 1; i < pointMatrix.length; i++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step " + i;

                    frame.points = new THREE.Object3D();

                    for (let k = 0; k < pointMatrix[i].length; k++) {

                         var length = pointMatrix[i].length;
                         var str = "";
                         var j = 0;

                         //  k------->
                         // i .
                         // |   .              |
                         // |   (pointMatrix)  |
                         // |       .          |
                         // v         .

                         // Length of finished label
                         var length = pointMatrix.length - 1;

                         // Length of current label
                         var m = 0;

                         // Push zeros for following iterations
                         //         [000....]
                         for (; m < pointMatrix[i].length - k - 1; m++) {
                              str += "0";
                         }

                         // Push current intervall handle's label
                         //            [000Z...]
                         if (i == 0) {
                              str += "1";
                         } else {
                              //str += this[s_scrollbar].handles[i - 1].label.text;
                              str += "C";
                         }
                         m++;

                         // Push previous handle's labels
                         //            [000ZYX.]
                         for (var l = 0; m < length; m++) {
                              if (i - 2 - l >= 0) {
                                   //str += this[s_scrollbar].handles[i - 2 - l].label.text;
                                   str += "C";
                              } else {
                                   // Fill with ones if no handles left
                                   //  [000ZYX1]
                                   str += "1";
                              }
                              l++;
                         }

                         // TODO: add to own labelmanager?
                         frame.labels.push("[" + str + "]");
                    }

                    var pointStack = new Array();

                    // The previous iteration has one point more.
                    for (var k in pointMatrix[i]) {
                         var imp = template.clone();
                         imp.position.copy(pointMatrix[i][k]);
                         imp.material.uniforms.diffuse.value.set(color);
                         frame.points.add(imp);

                         // Push first one from last iteration
                         pointStack.push(pointMatrix[i - 1][k]);

                         // Now add one point from current iteration
                         pointStack.push(pointMatrix[i][k]);
                    }
                    // Add last point from previous iteration
                    pointStack.push(pointMatrix[i - 1][pointMatrix[i - 1].length - 1]);

                    // Iterate over stacksize and make a segment from 2 points
                    for (var k = 2; k <= pointStack.length; k++) {
                         var segment = new Array();
                         segment.push(pointStack[k - 1]);
                         segment.push(pointStack[k - 2]);
                         // Paint the strips in the interval's color
                         var strip = (k % 2 == 0) ?
                              UTIL.Util.insertSegmentStrip(segment, COLORS.Colors.BLACK) : UTIL.Util.insertSegmentStrip(segment, COLORS.Colors.RED);
                         frame.lines.push(strip);

                    }

                    // Merge with the previous frame's lines
                    if (i != 1) {
                         frame.lines = frame.lines.concat(storyboard.frame(storyboard.size() - 1).lines);

                         // Remove the last mesh from the previous iteration
                         // to prevent overlapping lines
                         frame.lines.pop();
                    }
                    // Also add the newly generated polygon
                    frame.lines.push(UTIL.Util.insertSegmentStrip(pointMatrix[i], COLORS.Colors.RED));
                    frame.points.children = frame.points.children.concat(storyboard.frame(storyboard.size() - 1).points);

                    storyboard.append(frame);
               }

               return storyboard;
          }

     }

     return {
          Algorithm: Algorithm
     };
});

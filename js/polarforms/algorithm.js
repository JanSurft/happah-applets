//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah', '../lib/spherical-impostor', '../lib/scrollbar', '../lib/util', '../lib/colors'], function($, THREE, HAPPAH, IMPOSTOR, SCROLLBAR, UTIL, COLORS) {

     var s_controlPoints = Symbol('controlpoints');
     var s_scrollbar = Symbol('scrollbar');
     var s_labelmanager = Symbol('labelmanager');
     var s_handleChar = Symbol('handlechar');

     class Algorithm {

          constructor(controlPoints, scrollbar) {
               this.storyboard = this.storyboard.bind(this);
               this.adjustLabels = this.adjustLabels.bind(this);

               this[s_scrollbar] = scrollbar;
               this[s_controlPoints] = controlPoints;
               // Base character is latin alpha
               this[s_handleChar] = 0x03B1;
          }

          set labelmanager(labelmanager) {
               this[s_labelmanager] = labelmanager;
          }

          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
               this[s_scrollbar].value = 0.3;
               this[s_scrollbar].popHandle();
               this.adjustLabels();
          }

          adjustLabels() {
               if (this[s_controlPoints].length == 0) {
                    return;
               }
               // Add handles if necessary
               while (this[s_scrollbar].handles.length < this[s_controlPoints].length - 1) {
                    var handle = this[s_scrollbar].addHandle(0.5, COLORS.Colors.COLOR1, String.fromCharCode(this[s_handleChar]++));
                    // TODO make scrollbar manage it's own labelmanager, so we
                    // can simply call handle.setLabel("<text>"); maybe with
                    // color or something...
                    //handle.label = this[s_labelmanager].addLabel(String.fromCharCode(this[s_handleChar]++), handle, "handle" + handle.id, true);
               }
               while (this[s_scrollbar].handles.length > this[s_controlPoints].length - 1) {
                    var handle = this[s_scrollbar].popHandle();
                    //this[s_labelmanager].removeLabelsByTag("handle" + handle.id);
                    this[s_handleChar]--;
               }
          }

          evaluate(callback = null) {
               var segmentLength = this[s_controlPoints].length;
               var points = new Array(segmentLength);
               points[0] = new Array(segmentLength);
               for (var i in this[s_controlPoints]) {
                    points[0][i] = this[s_controlPoints][i];
               }
               // Until only 1 point remains
               for (var i = 0; i < segmentLength - 1; i++) {
                    points[i + 1] = new Array(segmentLength - i - 1);
                    // Calc next level points
                    for (var j = 0; j < points[i].length - 1; j++) {
                         var newPoint = points[i][j].clone();
                         // Not sure if value(i) or (i-1)
                         newPoint.multiplyScalar(1 - this[s_scrollbar].valueOf(i));
                         var tmpPoint = points[i][j + 1].clone();
                         tmpPoint.multiplyScalar(this[s_scrollbar].valueOf(i));
                         newPoint.add(tmpPoint);
                         points[i + 1][j] = newPoint;
                    }
                    callback(points[i + 1]);
               }
               // return points[points.length -1][0];
               return points;

          }

          storyboard() {
               var ratio;
               if (this[s_scrollbar] == null) {
                    ratio = 0.5;
               } else {
                    ratio = this[s_scrollbar].valueOf(0);
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

               this.adjustLabels();

               // matrix of points for every iteration
               var pointMatrix = new Array();

               pointMatrix = this.evaluate(function() {});

               // Helper points radius
               var radius = 3;
               var color = COLORS.Colors.GREY;

               frame0.points = new THREE.Object3D();

               // Impostor template
               var template = new IMPOSTOR.SphericalImpostor(radius);

               // Skip the control polygon
               for (var i = 1; i < pointMatrix.length; i++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step " + i;

                    frame.points = new THREE.Object3D();

                    //frame.points = pointMatrix[i];
                    for (var k = 0; k < pointMatrix[i].length; k++) {
                         var imp = template.clone();
                         imp.position.copy(pointMatrix[i][k]);
                         imp.material.uniforms.diffuse.value.set(color);
                         frame.points.add(imp);

                         var length = pointMatrix[i].length;
                         var str = "";
                         var j = 0;

                         //for (var m = 0; m < length; m++) {
                         //if (m < length - k - 1) {
                         //str += "0";
                         //} else {
                         //str += this[s_scrollbar].handles[i - 1 - m].label.text;
                         //}
                         //}

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
                         str += this[s_scrollbar].handles[i - 1].label.text;
                         m++;

                         // Push previous handle's labels
                         //            [000ZYX.]
                         for (var l = 0; m < length; m++) {
                              if (i - 2 - l >= 0) {
                                   str += this[s_scrollbar].handles[i - 2 - l].label.text;
                              } else {
                                   // Fill with ones if no handles left
                                   //  [000ZYX1]
                                   str += "1";
                              }
                              l++;
                         }

                         //for (var m = 0; m < pointMatrix[1].length; m++) {
                         //if (m < pointMatrix[i].length - k - 1) {
                         //// Fill with zeros for number of iterations
                         //// [0000000YX]
                         //str += "0";
                         //} else if (m == pointMatrix[i].length - k - 1) {
                         //// Take label of ratio's handle:
                         //// [000000ZYX]
                         //str += this[s_scrollbar].handles[i - 1].label.text;
                         //} else {
                         //// Add labels of previous iterations
                         //// -> Z, Z-1, Z-2 ...
                         //if (i - 2 >= 0) {
                         //str += this[s_scrollbar].handles[i - 2].label.text;
                         //} elsei {
                         //// In case there is no previous
                         //// iteration, fill with '1'
                         //str += "1";
                         //}
                         //}
                         //}
                         frame.labels.push("[" + str + "]");
                    }

                    var pointStack = new Array();

                    // The previous iteration has one point more.
                    for (var k in pointMatrix[i]) {
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

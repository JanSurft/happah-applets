//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah', '../lib/spherical-impostor', '../lib/scrollbar', '../lib/util'], function($, THREE, HAPPAH, IMPOSTOR, SCROLLBAR, UTIL) {

     var s_controlPoints = Symbol('controlpoints');
     var s_scrollbar = Symbol('scrollbar');
     var s_labelmanager = Symbol('labelmanager');

     class Algorithm extends HAPPAH.DeCasteljauAlgorithm {

          constructor(controlPoints, scrollbar) {
               super(controlPoints, scrollbar);
               this[s_scrollbar] = scrollbar;
               this[s_controlPoints] = controlPoints;
          }

          set labelmanager(labelmanager) {
               this[s_labelmanager] = labelmanager;
          }

          set scrollbar(scrollbar) {
               this[s_scrollbar] = scrollbar;
               this[s_scrollbar].value = 0.3;
               this[s_scrollbar].addHandle(0.7, 0xff0000);
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
               frame0.lines[0] = UTIL.Util.insertSegmentStrip(this[s_controlPoints], 0xff0000);
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

               // First set of points is the control polygon
               pointMatrix.push(this[s_controlPoints]);

               // fill matrix with points from each iteration
               this.evaluate(ratio, function add(points) {
                    pointMatrix.push(points);
               });

               // Helper points radius
               var radius = 3;
               var color = 0x3d3d3d;

               // Add labels for control polygon
               for (var i = 0; i < this[s_controlPoints].length; i++) {
                    //this[s_labelmanager].addLabel("[000]", this[s_controlPoints][i], "polar", false);
                    //frame0.labels.push("[000]");
                    //var obj = new THREE.Object3D();
                    //obj.position.copy(this[s_controlPoints][i]);
                    //frame0.points.add(obj);
               }

               // Skip the control polygon
               for (var i = 1; i < pointMatrix.length; i++) {
                    var frame = new HAPPAH.Storyboard.Frame();
                    frame.title = "Step " + i;

                    // Impostor template
                    var template = new IMPOSTOR.SphericalImpostor(radius);
                    frame.points = new THREE.Object3D();

                    //frame.points = pointMatrix[i];
                    for (var k in pointMatrix[i]) {
                         var imp = template.clone();
                         imp.position.copy(pointMatrix[i][k]);
                         imp.material.uniforms.diffuse.value.set(color);
                         frame.points.add(imp);
                         frame.labels.push("[100]");
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
                              UTIL.Util.insertSegmentStrip(segment, 0x3D3D3D) : UTIL.Util.insertSegmentStrip(segment, 0xFF0000);
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
                    frame.lines.push(UTIL.Util.insertSegmentStrip(pointMatrix[i], 0xFF0000));
                    frame.points.children = frame.points.children.concat(storyboard.frame(storyboard.size() - 1).points);

                    storyboard.append(frame);
               }

               // Create the last frame also by hand
               var frameLast = new HAPPAH.Storyboard.Frame();
               frameLast.title = "Limes curve";
               frameLast.lines[0] = UTIL.Util.insertSegmentStrip(this.subdivide(4, 0.5), 0xff0000);

               // Can't create a curve from two points.
               if (this[s_controlPoints].length > 2) {
                    storyboard.append(frameLast);
               }

               return storyboard;
          }

     }

     return {
          Algorithm: Algorithm
     };
});

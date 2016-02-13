HAPPAH.gui = function() {
     var scene;
     var camera;
     var renderer;
     var grid;
     var light;
     var spheres = [];

     // Controls:
     var controls;
     var transformControls;

     // Helper for visualising the 3D-Axis.
     var axisHelper;
     var axisHelperCones;

     // The selected object we want to drag around:
     var selected;

     // The new position we want the object to move to.
     var targetposition;
     var projector;
     var p3subp1;

     // For plane intersection
     var raycaster;

     // For moving the points:
     var mouseVec;
     var offset;
     var mouseDown;
     var points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(7, 6, 8), new THREE.Vector3(10, 0, 0), new THREE.Vector3(10, 10, 0), new THREE.Vector3(5, 10, 0), new THREE.Vector3(0, 4, 6)];
     var decasteljaupoints = [];

     var group;
     /**
      * Initializes with standard settings,
      * such as: 1 camera, 1 scene, 1 renderer.
      */
     this.init = function() {
          scene = HAPPAH.GUI_DEFAULTS.getScene();
          camera = HAPPAH.GUI_DEFAULTS.getCamera();
          renderer = HAPPAH.GUI_DEFAULTS.getRenderer();
          controls = HAPPAH.GUI_DEFAULTS.getControls(camera);
          //axisHelper = new THREE.AxisHelper(10);
          mouseVec = new THREE.Vector3();
          offset = new THREE.Vector3();
          targetposition = new THREE.Vector3();
          p3subp1 = new THREE.Vector3();
          raycaster = new THREE.Raycaster();


          group = new THREE.Object3D();


          for (point in points) {
               var mySphere = new HAPPAH.SphericalImpostor(1);
               mySphere.position = new THREE.Vector3();
               mySphere.position.x = points[point].x;
               mySphere.position.y = points[point].y;
               mySphere.position.z = points[point].z;
               spheres.push(mySphere);
               group.add(mySphere);
          }

          transformControls = new THREE.TransformControls(camera, renderer.domElement);
          var dragcontrols = new THREE.DragControls(camera, spheres,
               renderer.domElement);

          //HAPPAH.transform(transformControls, controls);
          scene.add(transformControls);

          // Default values.
          grid = HAPPAH.GUI_DEFAULTS.getGrid();
          lights = HAPPAH.GUI_DEFAULTS.getLights();

          projector = new THREE.Projector();


          scene.add(group);
          scene.add(grid);

          scene.add(lights);


          decasteljaupoints = deCasteljau(points, 100);
          insertSegmetStrip(decasteljaupoints);

          dragcontrols.on('hoveron', function(e) {

               transformControls.attach(e.object);
               cancelHideTransorm(); // *

          })

          dragcontrols.on('hoveroff', function(e) {

               if (e) delayHideTransform();

          })


          controls.addEventListener('start', function() {

               cancelHideTransorm();

          });

          controls.addEventListener('end', function() {

               delayHideTransform();

          });

          var hiding;

          function delayHideTransform() {

               cancelHideTransorm();
               hideTransform();

          }

          function hideTransform() {

               hiding = setTimeout(function() {

                    transformControls.detach(transformControls.object);

               }, 2500)

          }

          function cancelHideTransorm() {

               if (hiding) clearTimeout(hiding);

          }



          //scene.add(axisHelper);

          // Standard settings.
          camera.position.z = 20;
          controls.target.set(0, 0, 0);
          mouseDown = false;
          renderer.setSize(window.innerWidth, window.innerHeight);

          // Append to document.
          document.body.appendChild(renderer.domElement);

          renderer.domElement.addEventListener('mousemove', controls.onDocumentMouseMove, false);
          renderer.domElement.addEventListener('mousedown', controls.onDocumentMouseDown, false);
          renderer.domElement.addEventListener('mouseup', controls.onDocumentMouseUp, false);

          // Success message.
          console.log("happah initialized.");
     }

     /**
      * Returns the position of our HTML element
      */
     function getElementPosition(element) {
          var position = new THREE.Vector2(0, 0);

          while (element) {
               position.x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
               position.y += (element.offsetTop - element.scrollTop + element.clientTop);
               element = element.offsetParent;
          }
          return position;
     }

     /**
      * DeCasteljau algorithm
      */
     function deCasteljau(controlPoints, recursiveDepth) {
          // Resulting point-array after every iteration.
          var points = [];

          // Fill in the control points for first iteration.
          for (i = 0; i < controlPoints.length; i++) {
               points[i] = controlPoints[i];
          }

          // The actual algorithm
          for (j = 0; j < recursiveDepth; j++) {
               // Temporary array.
               var tempPoints = [];

               // The first control point does not change.
               tempPoints[0] = points[0];

               // Get the middle of each segment and make it a new point.
               for (i = 0; i < points.length - 1; i++) {
                    tempPoints[i + 1] = new THREE.Vector3(
                         (points[i + 1].x + points[i].x) / 2, (points[i + 1].y + points[i].y) / 2, (points[i + 1].z + points[i].z) / 2);
               }
               // The last control point remains unchanged.
               tempPoints[tempPoints.length] = points[points.length - 1];

               // Set points array for next iteration.
               points = tempPoints;
          }
          return points;
     }

     /**
      * Takes a bunch of points and connects them with lines.
      */
     function insertSegmetStrip(points, showPoints) {
          var lineGeometry = new THREE.Geometry();
          var lineMaterial = new THREE.LineBasicMaterial({
               color: 0xCC0000
          });

          if (showPoints) {
               for (i = 0; i < points.length; i++) {
                    lineGeometry.vertices.push(points[i]);
                    var boxG = new THREE.Geometry();
                    boxG.translate(points[i].x, points[i].y, points[i].z);
                    var boxM = new THREE.MeshBasicMaterial({
                         color: 0x00ff00
                    });
                    var box = new THREE.Mesh(boxG, boxM);
                    scene.add(box);
               }
          } else {
               for (i = 0; i < points.length; i++) {
                    lineGeometry.vertices.push(points[i]);
               }
          }
          lineGeometry.computeLineDistances();
          var line = new THREE.Line(lineGeometry, lineMaterial);

          return line;


     }

     /**
      * Draws an array of points.
      */
     this.drawPointCloud = function(points) {
          var pointGeometry = new THREE.Geometry();
          var material = new THREE.PointCloudMaterial({
               size: 6,
               sizeAttenuation: false
          });
          var pointCloud = new THREE.PointCloud(pointGeometry, material);

          // Adds all the points to pointgeometry.
          for (i = 0; i < points.length; i++) {
               pointGeometry.vertices.push(new THREE.Vector3(points[i][0],
                    points[i][1],
                    points[i][2]));
          }
          // Connect the points with lines.
          var line = new THREE.Line(pointGeometry,
               new THREE.LineBasicMaterial({
                    color: 0xccafff,
                    opacity: 0.5
               }));

          // Add to scene:
          happah.scene.add(line);
          happah.scene.add(pointCloud);

     }

     // Renders the scene in each renderer (only one currently).

     var line = deCasteljau(points);
     var controlLine = insertSegmetStrip(points);

     this.animate = function() {
          requestAnimationFrame(this.animate.bind(this));

          scene.remove(line);
          scene.remove(controlLine);
          decasteljaupoints = deCasteljau(points, 50);
          line = insertSegmetStrip(decasteljaupoints);
          controlLine = insertSegmetStrip(points);
          scene.add(line);
          scene.add(controlLine);


          this.render();
          controls.update();
          transformControls.update();
     }

     this.render = function() {
          renderer.render(scene, camera);
     }
}

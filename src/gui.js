/**
 * Holds default values for simple viewport setup.
 */
HAPPAH.GUI_DEFAULTS = {
     getScene: function() {
          return new THREE.Scene();
     },

     getCamera: function( /* options */ ) {
          var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          //camera.position.y = 20;

          return camera;
     },

     getRenderer: function( /* options */ ) {
          var canvas = $('#happah')[0];
          var context = canvas.getContext('webgl2');
          context.getExtension('EXT_frag_depth');
          var parameters = { canvas: canvas, context: context };
          renderer = new THREE.WebGLRenderer(parameters);
          renderer.setClearColor(0xFFFFFF);
          return renderer;
     },

     getGrid: function() {
          return new THREE.GridHelper(100, 10);
     },

     getControls: function(camera) {
          // TODO: Remove all references to THREE->Examples!
          //return new THREE.TrackballControls(camera);
          return new THREE.TrackballControls(camera);
     },

     getDummyAlgorithm: function() {
          return function(points, value) {
               return points;
          };
     },

     getLights: function() {
          var lights = new THREE.Object3D();
          var light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(0, 200, 0);
          lights.add(light);
          light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(100, 200, 100);
          lights.add(light);
          light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(-100, -200, -100);
          lights.add(light);
          lights.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
          lights.add(new THREE.AmbientLight(0x000000));
          return lights;
     }
};

(function(happah, $, undefined) {
     globalRecursionDepth = 0;

     var scene;
     var camera;
     var renderer;
     var grid;
     var light;

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
     var algorithm;
     var mouseVec;
     var offset;
     var mouseDown;
     var algorithmPoints = [];
     var algorithmLine;
     var controlLine;
     var controlPoints = [];
     var controlPointImpostors;

     var dragcontrols;
     var group;
     /**
      * Initializes with standard settings,
      * such as: 1 camera, 1 scene, 1 renderer.
      */
     happah.init = function() {
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

          // Get a dummy algorithm
          algorithm = HAPPAH.GUI_DEFAULTS.getDummyAlgorithm();
          controlPointImpostors = new THREE.Object3D();

          for (i = 0; i < 3; i++) {
               addControlPoint(new THREE.Vector3(i / 2, i * 3, Math.sin(i)));
          }

          transformControls = new THREE.TransformControls(camera, renderer.domElement);

          //HAPPAH.transform(transformControls, controls);
          scene.add(transformControls);

          // Default values.
          grid = HAPPAH.GUI_DEFAULTS.getGrid();
          lights = HAPPAH.GUI_DEFAULTS.getLights();

          projector = new THREE.Projector();


          //scene.add(group);
          scene.add(grid);

          scene.add(lights);

          // Standard settings.
          camera.position.z = 20;
          controls.target.set(0, 0, 0);
          mouseDown = false;
          renderer.setSize(window.innerWidth, window.innerHeight);

          // Append to document.
          //document.body.appendChild(renderer.domElement);

          renderer.domElement.addEventListener('mousemove', controls.onDocumentMouseMove, false);
          renderer.domElement.addEventListener('mousedown', controls.onDocumentMouseDown, false);
          renderer.domElement.addEventListener('mouseup', controls.onDocumentMouseUp, false);

          // Success message.
          console.log("happah initialized.");
     }

     /**
      * Set the algorithm
      */
     happah.setAlgorithm = function(a) {
          algorithm = a;
     }

     /**
      * Add new control point.
      */
     function addControlPoint(point) {
          var sphere = new HAPPAH.SphericalImpostor(1);
          sphere.material.uniforms.diffuse.value.set(new THREE.Color(0x888888));
          sphere.position.x = point.x;
          sphere.position.y = point.y;
          sphere.position.z = point.z;
          controlPointImpostors.add(sphere);
          controlPoints.push(point);

          scene.add(controlPointImpostors);
          // Update drag controls
          dragcontrols = new THREE.DragControls(camera, controlPointImpostors.children,
               renderer.domElement);
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
      * Takes a bunch of points and connects them with lines.
      */
     function insertSegmetStrip(points, color) {
          var lineGeometry = new THREE.Geometry();
          var lineMaterial = new THREE.LineBasicMaterial();
          lineMaterial.color = color;
          lineMaterial.linewidth = 5;

          var showPoints = false;
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
     happah.drawPointCloud = function(points) {
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
     happah.animate = function() {
          requestAnimationFrame(this.animate.bind(this));

          // Remove the algorithm's line from the scene so we can edit it.
          scene.remove(algorithmLine);

          // Same goes for the control line.
          scene.remove(controlLine);

          // Update control points from current impostor positions.
          for (i = 0; i < controlPoints.length; i++) {
               controlPoints[i].copy(controlPointImpostors.children[i].position);
          }

          // Apply algorithm
          algorithmPoints = algorithm({
               controlPoints1D: controlPoints,
               recursionDepth: 3//TODO: text.Rekursionstiefe
          });

          // Connect the calculated points to a line.
          algorithmLine = insertSegmetStrip(algorithmPoints, new THREE.Color(0x009D82));
          controlLine = insertSegmetStrip(controlPoints, new THREE.Color(0xFF0000));

          // Add them to the scene.
          scene.add(algorithmLine);
          scene.add(controlLine);


          this.render();
          controls.update();
          transformControls.update();
     }

     happah.render = function() {
          renderer.render(scene, camera);
     }
}(window.happah = window.happah || {}, jQuery ));


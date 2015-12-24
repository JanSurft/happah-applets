happah = function() {
     var scene;
     var camera;
     var renderer;
     var controls;
     var grid;
     var light;
     var sphere;

     // Helper arrow to show players view direction.
     // var arrow;

     // Arrows to show the moving plane.
     var arrow1, arrow2;

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

     /**
      * Initializes with standard settings,
      * such as: 1 camera, 1 scene, 1 renderer.
      */
     this.init = function() {
          scene = DEFAULTS.getScene();
          camera = DEFAULTS.getCamera();
          renderer = DEFAULTS.getRenderer();
          controls = DEFAULTS.getControls(camera);
          mouseVec = new THREE.Vector3();
          offset = new THREE.Vector3();
          targetposition = new THREE.Vector3();
          p3subp1 = new THREE.Vector3();
          raycaster = new THREE.Raycaster();

          // Default values.
          grid = DEFAULTS.getGrid();
          light = DEFAULTS.getLight(0x404040);

          // Arrow helper for orientation.
          // arrow = new THREE.ArrowHelper(camera.getWorldDirection(), camera.getWorldPosition(), 3, 0xffff00, 3,2);
          projector = new THREE.Projector();

          var sphereGeo = new THREE.SphereGeometry(2,16,16);
          var sphereMat = new THREE.MeshBasicMaterial({color:0x0fff0f});
          sphere = new THREE.Mesh(sphereGeo, sphereMat);

          var boundingBox = new THREE.BoundingBoxHelper(sphere, 0xff0000);
          boundingBox.update();
          scene.add(boundingBox);

          scene.add(sphere);
          scene.add(grid);
          scene.add(light);
          // scene.add(arrow);

          // Standard settings.
          camera.position.z = 20;
          controls.target.set( 0,0,0);
          mouseDown = false;
          renderer.setSize(window.innerWidth, window.innerHeight);

          // Append to document.
          document.body.appendChild(renderer.domElement);

          renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
          renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
          renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

          // Success message.
          console.log("happah initialized.");
     }

     /**
      * Returns the position of our HTML element
      */
     function getElementPosition(element) {
          var position = new THREE.Vector2(0, 0);

          while (element) {
               position.x += (element.offsetLeft - element.scrollLeft
                         + element.clientLeft);
               position.y += (element.offsetTop - element.scrollTop
                         + element.clientTop);
               element = element.offsetParent;
          }
          return position;
     }

     /**
      * Moves objects around, if selected.
      */
     function onDocumentMouseMove(event) {
          event.preventDefault();

          // Position of our renderer
          var pos = getElementPosition(this);

          // Original mouse position
          mouseVec.x = ( (event.clientX - pos.x) / window.innerWidth) * 2 - 1;
          mouseVec.y = - ( (event.clientY - pos.y) / window.innerHeight) * 2 + 1;

          // Origin: mouseVec, direction: camera view
          raycaster.setFromCamera(mouseVec.clone(), camera);
          var ray = raycaster.ray;

          // If it doesn't have a face, we don't want to move it.
          if (selected && selected.face != null) {
               // In order to drag around spheres, we need the bounding box.
               // TODO
               var normal = selected.normal;
               var intersectFaceNormal = selected.face.normal;

               // Prevent camera movement
               controls.noRotate = true;

               var denom = normal.dot(ray.direction);
               if (denom == 0) {
                    return;
               }

               // Calculate the distance from camera plane to object.
               var num = normal.dot( p3subp1.copy(selected.point).sub(ray.origin));
               var distance = num / denom;

               targetposition.copy(ray.direction).multiplyScalar(distance).add(ray.origin).sub(offset);

               // Only move within the plane the camera is facing.
               // => Lock one axis at a time.
               var xLock, yLock, zLock;
               xLock = intersectFaceNormal.x;
               yLock = intersectFaceNormal.y;
               zLock = intersectFaceNormal.z;

               if (xLock) {
                    // Move within ZY-plane
                    selected.object.position.y = targetposition.y;
                    selected.object.position.z = targetposition.z;
               } else if (yLock) {
                    // Move within XZ-Plane
                    selected.object.position.x = targetposition.x;
                    selected.object.position.z = targetposition.z;
               } else if (zLock) {
                    // Move within XY-Plane
                    selected.object.position.x = targetposition.x;
                    selected.object.position.y = targetposition.y;
               } else {
                    // Default case.
                    selected.object.position.z = targetposition.z;
                    selected.object.position.y = targetposition.y;
                    selected.object.position.x = targetposition.x;
               }
               // Update the plane arrows.
               setArrows(selected.object.position, intersectFaceNormal);

               console.log("xLock: " + xLock + " yLock: " + yLock + " zLock: " + zLock);
               return;
          } else {
               // Allow camera rotation
               controls.noRotate = false;
          }
     }

     function setArrows(origin, normal) {
          scene.remove(arrow1);
          scene.remove(arrow2);
          if (normal.x) {
               arrow1 = new THREE.ArrowHelper(new THREE.Vector3(0,0,1),
                         origin, 5, 0xffff00);
               arrow2 = new THREE.ArrowHelper(new THREE.Vector3(0,1,0),
                         origin, 5, 0xffff00);
          } else if (normal.y) {
               arrow1 = new THREE.ArrowHelper(new THREE.Vector3(1,0,0),
                         origin, 5, 0xffff00);
               arrow2 = new THREE.ArrowHelper(new THREE.Vector3(0,0,1),
                         origin, 5, 0xffff00);
          } else {
               arrow1 = new THREE.ArrowHelper(new THREE.Vector3(0,1,0),
                         origin, 5, 0xffff00);
               arrow2 = new THREE.ArrowHelper(new THREE.Vector3(1,0,0),
                         origin, 5, 0xffff00);
          }
          scene.add(arrow1);
          scene.add(arrow2);
     }
     /**
      * When MOUSE1 is pressed,
      * we apply the position to mouseVec.
      */
     function onDocumentMouseDown(event) {
          event.preventDefault();

          var intersects = raycaster.intersectObjects(scene.children);
          var ray = raycaster.ray;
          // scene.remove(arrow);
          // arrow = new THREE.ArrowHelper(ray.direction, camera.getWorldPosition(),30, 0xfff00, 3, 3);
          // scene.add(arrow);
          var normal = ray.direction;

          if (intersects.length > 0) {
               selected = intersects[0];
               if (selected.object == grid) {
                    selected = null;
                    console.log("Attempted to drag grid!");
                    return;
               }
               selected.ray = ray;
               selected.normal = normal;
               offset.copy(selected.point).sub(selected.object.position);
               renderer.domElement.style.cursor = 'move';

               console.log("drag");
          }
          mouseDown = true;
          console.log("mousedown");
     }

     /**
      * When MOUSE1 is released, we don't want to drag anything.
      */
     function onDocumentMouseUp(event) {
          event.preventDefault();

          if (selected) {
               selected = null;
          }
          renderer.domElement.style.cursor = 'auto';
          mouseDown = false;

          // Remove plane arrows from the scene.
          // scene.remove(planeArrows);

          console.log("mouseUp");
     }

     /**
      * Draws an array of points.
      */
     this.drawPointCloud = function(points) {
          var pointGeometry = new THREE.Geometry();
          var material = new THREE.PointCloudMaterial( { size: 6, sizeAttenuation: false });
          var pointCloud = new THREE.PointCloud(pointGeometry, material);

          // Adds all the points to pointgeometry.
          for (i = 0; i < points.length; i++) {
               pointGeometry.vertices.push(new THREE.Vector3(points[i][0],
                              points[i][1],
                              points[i][2]));
          }
          // Connect the points with lines.
          var line = new THREE.Line(pointGeometry,
                    new THREE.LineBasicMaterial({color:0xccafff, opacity: 0.5 }));

          // Add to scene:
          happah.scene.add(line);
          happah.scene.add(pointCloud);

     }

     // Renders the scene in each renderer (only one currently).
     this.render = function() {
          requestAnimationFrame( this.render.bind(this) );

          controls.update();
          renderer.render(scene, camera);
     }
}

/**
 * Holds default values for simple viewport setup.
 */
var DEFAULTS = {
     getScene: function() {
          return new THREE.Scene();
     },

     getCamera: function(/* options */) {
          return new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
     },

     getRenderer: function(/* options */) {
          return new THREE.WebGLRenderer();
     },

     getGrid: function() {
          return new THREE.GridHelper(100, 10);
     },

     getControls: function(camera) {
          return new THREE.TrackballControls(camera);
     },

     getLight: function(color) {
          return new THREE.AmbientLight(color);
     }
};

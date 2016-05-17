//////////////////////////////////////////////////////////////////////////////
//
// Scrollbar
// Creates and handles a scrollbar in camera space
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'spherical-impostor'], function($, THREE, happah) {
     var s_camera = Symbol('camera');
     var s_scene = Symbol('scene');
     var s_controls = Symbol('controls');

     // Drag control variables
     var s_raycaster = Symbol('raycaster');
     var s_axisLine = Symbol('line');
     var s_selectionPlane = Symbol('plane');
     var s_selectionLine = Symbol('line');
     var s_selectedObject = Symbol('selectedobject');
     var s_offset = Symbol('offset');
     var s_enabled = Symbol('enabled');

     // For testing purposes only
     var s_bar = Symbol('bar');
     var s_ball = Symbol('ball');
     var s_canvas = Symbol('canvas');

     class Scrollbar {

          constructor(scene, controls, camera, canvas) {
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);
               this.mouseUp = this.mouseUp.bind(this);

               this[s_canvas] = canvas;
               this[s_scene] = scene;
               this[s_controls] = controls;
               this[s_camera] = camera;
               this[s_enabled] = true;

               this[s_raycaster] = new THREE.Raycaster();

               // Remove camera from the scene to give birth to some children
               this[s_scene].remove(this[s_camera]);

               // Axis-arrow geometry
               var geo = new THREE.CylinderGeometry(1, 1, 350, 32);
               var coneGeometry = new THREE.CylinderGeometry(0, 3, 8, 5, 1);
               var boxGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
               var textGeo = new THREE.Geometry();
               // TODO: use textGeometry!!!
               textGeo = geomify('0');
               textGeo.translate(-1.5, 5, 0);
               coneGeometry.rotateZ(-(Math.PI / 2));
               coneGeometry.translate(175, 0, 0);
               geo.rotateZ(Math.PI / 2);
               geo.merge(textGeo);
               textGeo = geomify('1');
               textGeo.translate(150 - 0.5, 5, 0);
               geo.merge(textGeo);
               textGeo = geomify('-1');
               textGeo.translate(-151, 5, 0);
               geo.merge(textGeo);
               geo.merge(coneGeometry);
               geo.merge(boxGeometry);
               boxGeometry.translate(150, 0, 0);
               geo.merge(boxGeometry);
               boxGeometry.translate(-300, 0, 0);
               geo.merge(boxGeometry);
               var mat = new THREE.MeshBasicMaterial({
                    color: 0x4D4D4D
               });
               this[s_bar] = new THREE.Mesh(geo, mat);
               this[s_bar].position.set(0, -($(canvas).height() / 6), -0.3);

               // Ball to move along the scrollbar
               this[s_ball] = new happah.SphericalImpostor(5);
               this[s_ball].material.uniforms.diffuse.value.set(0xff5555);
               //this[s_ball].position.applyMatrix4(this[s_camera].matrixWorldInverse);
               this[s_ball].position.set(-120, -($(canvas).height() / 6), 1);

               // Add to camera space
               this[s_camera].add(this[s_bar]);
               this[s_camera].add(this[s_ball]);

               // for camera space selection
               this[s_selectionPlane] = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100, 8, 8), new THREE.MeshBasicMaterial({
                    color: 0x33ee77,
                    alphaTest: 0,
                    visible: false
               }));
               this[s_selectionPlane].position.copy(this[s_ball].position);
               this[s_camera].add(this[s_selectionPlane]);
               this[s_selectionLine] = new THREE.Line3(new THREE.Vector3(-175, -($(canvas).height() / 6), 0),
                    new THREE.Vector3(175, -($(canvas).height() / 6), 0));
               this[s_camera].add(this[s_selectionLine]);
               this[s_camera].updateProjectionMatrix();

               // Add the camera with children to the scene
               this[s_scene].add(this[s_camera]);

               this[s_offset] = new THREE.Vector3();
               //this[s_scene].add(this[s_selectionPlane]);
               //this[s_selectionPlane].lookAt(this[s_camera].position);
          }
          enable() {
               this[s_enabled] = true;
          }
          disable() {
               this[s_enabled] = false;
          }

          /** Returns the position of our HTML element */
          getElementPosition(element) {
               var position = new THREE.Vector2(0, 0);

               while (element) {
                    //console.log("parent: " + element.className);
                    position.x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                    position.y += (element.offsetTop - element.scrollTop + element.clientTop);
                    element = element.offsetParent;
               }
               return position;
          }

          /** Called when a mouse button is pressed */
          mouseDown(event) {
               event.preventDefault();

               if (this[s_enabled] == false) {
                    return;
               }
               // TODO: don't calculate the position every time.
               //       -> only on window resize...
               var elementPosition = this.getElementPosition(event.currentTarget);

               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

               // Not needed because the camera orientation does not change.
               //this[s_selectionPlane].lookAt(0, 0, 0);

               // Set the raycaster
               // Don't make the ray project into world space
               // Unproject mouseposition to get corrent coordinates then
               // transform back into screenspace
               if (this[s_camera] instanceof THREE.PerspectiveCamera) {
                    // TODO: adapt to perspective camera
                    this[s_raycaster].ray.origin.set(0, 0, 0); //setFromMatrixPosition(this[s_camera].matrixWorldInverse);
                    this[s_raycaster].ray.direction.set(mouseVector.x, mouseVector.y, 0.5).sub(this[s_raycaster].ray.origin).normalize();
               } else if (this[s_camera] instanceof THREE.OrthographicCamera) {
                    this[s_raycaster].ray.origin.set(mouseVector.x, mouseVector.y, -1).unproject(this[s_camera]).applyMatrix4(this[s_camera].matrixWorldInverse);
                    this[s_raycaster].ray.origin.setZ(this[s_camera].position.z);
                    this[s_raycaster].ray.direction.set(0, 0, -1);
               } else {
                    console.error('THREE.Raycaster: Unsupported camera type.');
               }

               // SET UP A RAY MANUALLY
               var ray = new THREE.Ray(this[s_raycaster].ray.origin, this[s_raycaster].ray.direction);
               var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
               console.log(ray.intersectPlane(plane));

               // Set the raycaster position // TODO: only in 3D?
               //this[s_raycaster].set(this[s_camera].position, vector.sub(this[s_camera].position).normalize());
               // TEST
               //var asd = new THREE.ArrowHelper(this[s_raycaster].ray.direction, this[s_raycaster].ray.origin, 100, 0xdddd44, 5, 5);
               var asd = new happah.SphericalImpostor(5);
               asd.position.copy(ray.intersectPlane(plane));
               console.log(plane.distanceToPoint(this[s_ball].position));
               //this[s_camera].add(asd);
               this[s_camera].updateProjectionMatrix();

               // Find all intersected objects
               var intersects = this[s_raycaster].intersectObject(this[s_ball]);

               if (intersects.length > 0) {
                    console.log("ball selected!");
                    this[s_selectedObject] = true;

                    // Disable the controls
                    this[s_controls].enabled = false;

                    // Set the selection - first intersected object
                    this[s_selectedObject] = intersects[0];

                    // Calculate the offset
                    var intersects = this[s_raycaster].intersectObject(this[s_selectionPlane]);
                    console.log(this[s_raycaster]);
                    console.log(intersects);

                    this[s_offset].copy( /*intersects[0].point*/ ray.intersectPlane(plane)).sub(this[s_ball].position);
               }
          }

          /** Called whenever a mouse button is moved */
          mouseMove(event) {
               event.preventDefault();

               if (this[s_enabled] == false) {
                    return;
               }
               var elementPosition = this.getElementPosition(event.currentTarget);

               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;
               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

               // Get 3D vector from 3D mouse position using
               // 'unproject' function
               var vector = new THREE.Vector2(mouseX, mouseY);
               // vector.unproject(this[s_camera]);

               // Copied from THREE.Raycaster
               if (this[s_camera] instanceof THREE.PerspectiveCamera) {
                    // TODO: adapt to perspective camera
                    this[s_raycaster].ray.origin.set(0, 0, 0); //setFromMatrixPosition(this[s_camera].matrixWorldInverse);
                    this[s_raycaster].ray.direction.set(mouseVector.x, mouseVector.y, 0.5).sub(this[s_raycaster].ray.origin).normalize();
               } else if (this[s_camera] instanceof THREE.OrthographicCamera) {
                    this[s_raycaster].ray.origin.set(mouseVector.x, mouseVector.y, -1).unproject(this[s_camera]).applyMatrix4(this[s_camera].matrixWorldInverse);
                    this[s_raycaster].ray.origin.setZ(0);
                    this[s_raycaster].ray.direction.set(0, 0, -1);
               } else {
                    console.error('THREE.Raycaster: Unsupported camera type.');
               }

               // SET UP A RAY MANUALLY
               var ray = new THREE.Ray(this[s_raycaster].ray.origin, this[s_raycaster].ray.direction);
               var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
               // this[s_camera].position, vector.sub(this[s_camera].position).normalize());
               // ^Only in 3D.

               if (this[s_selectedObject]) {
                    // Scene has changed so we need to redraw.
                    this[s_scene].redraw();

                    // Check the position where the plane is intersected
                    var intersects = this[s_raycaster].intersectObject(this[s_selectionPlane]);

                    if (intersects[0] == null) {
                         console.log("Warning: lost selection plane!");
                         this.mouseUp();
                         //          return;
                    }
                    console.log("translating..");

                    // Reposition the object based on the intersection point with the plane
                    var newPos = this[s_selectionLine].closestPointToPoint(ray.intersectPlane(plane).sub(this[s_offset]));
                    //this[s_selectedObject].copy(newPos);
                    this[s_ball].position.copy(newPos);

                    // Update the plane's position
                    this[s_selectionPlane].position.copy(this[s_selectedObject].position);
               } else {
                    // Update position of the plane if need
                    var intersects =
                         this[s_raycaster].intersectObject(this[s_ball]);
                    if (intersects.length > 0) {
                         // TODO: is this really necessary?
                         this[s_selectionPlane].position.copy(intersects[0].position);
                         //this[s_selectionPlane].lookAt(this[s_camera].position);
                    }
               }
          }

          /** Called whenever a mouse button is released */
          mouseUp() {
               // Enable the controls
               this[s_controls].enabled = true;
               this[s_selectedObject] = false;
          }

     } //class Scrollbar

     return {
          Scrollbar: Scrollbar
     };
});

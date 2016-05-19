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

     // Member variables
     var s_raycaster = Symbol('raycaster');
     var s_selectionPlane = Symbol('plane');
     var s_selectionRay = Symbol('ray');
     var s_selectionLine = Symbol('line');
     var s_selectedObject = Symbol('selectedobject');
     var s_enabled = Symbol('enabled');
     var s_bar = Symbol('bar');
     var s_ball = Symbol('ball');
     var s_value = Symbol('value');

     class Scrollbar {

          constructor(scene, controls, camera, canvas) {
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);
               this.mouseUp = this.mouseUp.bind(this);

               var midScreen = -canvas.height() / 6;
               this[s_scene] = scene;
               this[s_controls] = controls;
               this[s_camera] = camera;
               this[s_enabled] = true;
               this[s_value] = 0;

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
               this[s_bar].position.set(0, midScreen, -0.3);

               // Ball to move along the scrollbar
               this[s_ball] = new happah.SphericalImpostor(5);
               this[s_ball].material.uniforms.diffuse.value.set(0xff5555);
               this[s_ball].position.set(0, midScreen, 1);

               // Add to camera space
               this[s_camera].add(this[s_bar]);
               this[s_camera].add(this[s_ball]);

               this[s_selectionPlane] = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
               this[s_selectionRay] = new THREE.Ray();
               this[s_selectionLine] = new THREE.Line3(new THREE.Vector3(-175, -($(canvas).height() / 6), 0),
                    new THREE.Vector3(175, -($(canvas).height() / 6), 5));
               this[s_camera].add(this[s_selectionLine]);
               this[s_camera].updateProjectionMatrix();

               // Add the camera with children to the scene
               this[s_scene].add(this[s_camera]);
          }
          enable() {
               this[s_enabled] = true;
          }
          disable() {
               this[s_enabled] = false;
          }
          get value() {
               return this[s_value];
          }
          set value(value) {
               this[s_value] = value;
               this[s_ball].position.setX(150 * value);
          }

          /** Returns the position of our HTML element */
          getElementPosition(element) {
               var position = new THREE.Vector2(0, 0);

               while (element) {
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

               var mouseVector = new THREE.Vector3(mouseX, mouseY, -1);

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
                    this[s_raycaster].ray.direction.set(0, 0, -1);
               } else {
                    console.error('THREE.Raycaster: Unsupported camera type.');
               }

               // Set up ray from mouse position
               this[s_selectionRay].set(this[s_raycaster].ray.origin, this[s_raycaster].ray.direction);

               // Find all intersected objects
               var intersects = this[s_raycaster].intersectObject(this[s_ball]);

               if (intersects.length > 0) {
                    // Enable drag-mode
                    this[s_selectedObject] = true;

                    // Disable the controls
                    this[s_controls].enabled = false;
               } else {
                    this[s_selectedObject] = false;
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
               var mouseVector = new THREE.Vector3(mouseX, mouseY, -1);

               // Set up ray from mouse position
               this[s_selectionRay].set(mouseVector.unproject(this[s_camera]).applyMatrix4(this[s_camera].matrixWorldInverse), new THREE.Vector3(0, 0, -1));

               if (this[s_selectedObject]) {
                    // Scene has changed so we need to redraw.
                    this[s_scene].redraw();

                    // Reposition the object based on the intersection point with the plane
                    var newPos = this[s_selectionLine].closestPointToPoint(this[s_selectionRay].intersectPlane(this[s_selectionPlane]));
                    this[s_ball].position.copy(newPos);

                    // Update scrollbar value
                    this[s_value] = newPos.x / 150;
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

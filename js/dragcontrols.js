//////////////////////////////////////////////////////////////////////////////
//
// Drag Controls implementation is based on script-tutorials.com.
// @url https://www.script-tutorials.com/webgl-with-three-js-lesson-10/
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'happah'], function($, THREE, happah) {
     var s_camera = Symbol('camera');
     var s_scene = Symbol('scene');
     var s_controls = Symbol('controls');
     var s_renderer = Symbol('renderer');

     // Drag control variables
     var s_raycaster = Symbol('raycaster');
     var s_selectedObject = Symbol('selected');
     var s_selectionPlane = Symbol('plane');
     var s_offset = Symbol('offset');

     class DragControls {

          constructor(scene, renderer, controls, camera) {
               this.mouseUp = this.mouseUp.bind(this);
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);
               this.mouseWheel = this.mouseWheel.bind(this);

               // Initialize viewport variables
               this[s_scene] = scene;
               this[s_controls] = controls;
               this[s_camera] = camera;
               this[s_renderer] = renderer;

               // Initialize drag control variables
               this[s_raycaster] = new THREE.Raycaster();

               // Helper plane in which the objects will move
               // Attention: at any time, the plane must be bigger than the
               // dragged object or it won't work!
               this[s_selectionPlane] = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({
                    color: 0x00ee22,
                    alphaTest: 0,
                    visible: false
               }));
               this[s_offset] = new THREE.Vector3();
               this[s_scene].add(this[s_selectionPlane]);
               this[s_selectionPlane].lookAt(this[s_camera].position);
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

          /** Called whenever the mouse wheel is moved */
          mouseWheel(event) {
               event.preventDefault();

               var delta;

               if (event.wheelDelta) {
                    delta = event.wheelDeltaY / 35;
               } else if (event.detail) {
                    // This works with Firefox
                    delta = -event.detail / 2;
               } else {
                    delta = 0;
               }
               // Zoom speed
               delta = delta * 0.06;

               if (this[s_camera].zoom + delta < 0) {
                    delta = 0;
               }
               this[s_camera].zoom += delta;
               this[s_camera].updateProjectionMatrix();
          }

          /** Called when a mouse button is pressed */
          mouseDown(event) {
               event.preventDefault();
               // TODO: don't calculate the position every time.
               var elementPosition = this.getElementPosition(this[s_renderer].domElement);
               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / this[s_renderer].domElement.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / this[s_renderer].domElement.height) * 2 + 1;

               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

               // Not needed because the camera orientation does not change.
               //this[s_selectionPlane].lookAt(this[s_camera].position);

               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);

               // Get 3D vector from 3D mouse position using 'unproject'
               // Only in 3D.

               // Set the raycaster position // TODO: only in 3D?
               //this[s_raycaster].set(this[s_camera].position, vector.sub(this[s_camera].position).normalize());

               // Find all intersected objects
               var intersects = this[s_raycaster].intersectObjects(this[s_scene]._controlPointImpostors.children, true);

               if (intersects.length > 0) {
                    // Disable the controls
                    this[s_controls].enabled = false;

                    // Set the selection - first intersected object
                    this[s_selectedObject] = intersects[0];

                    // Calculate the offset
                    var intersects = this[s_raycaster].intersectObject(this[s_selectionPlane]);

                    this[s_offset].copy(intersects[0].point).sub(this[s_selectionPlane].position);
               }
          }

          /** Called whenever a mouse button is moved */
          mouseMove(event) {
               event.preventDefault();
               var elementPosition = this.getElementPosition(this[s_renderer].domElement);

               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / this[s_renderer].domElement.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / this[s_renderer].domElement.height) * 2 + 1;
               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

               // Get 3D vector from 3D mouse position using
               // 'unproject' function
               var vector = new THREE.Vector2(mouseX, mouseY);
               // vector.unproject(this[s_camera]);

               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);
               // this[s_camera].position, vector.sub(this[s_camera].position).normalize());
               // ^Only in 3D.

               if (this[s_selectedObject]) {
                    // Scene has changed so we need to redraw.
                    this[s_scene].redraw();

                    // Check the position where the plane is intersected
                    var intersects =
                         this[s_raycaster].intersectObject(this[s_selectionPlane]);
                    // Reposition the object based on the intersection point with the plane
                    this[s_selectedObject].position.copy(intersects[0].point.sub(this[s_offset]));

                    this[s_selectionPlane].position.copy(this[s_selectedObject].position);
               } else {
                    // Update position of the plane if need
                    var intersects =
                         this[s_raycaster].intersectObjects(this[s_scene]._controlPointImpostors.children, true);
                    if (intersects.length > 0) {
                         // TODO: is this really necessary?
                         this[s_selectionPlane].position.copy(intersects[0].position);
                         // this[s_selectionPlane].lookAt(this[s_camera].position);
                    }
               }
          }

          /** Called whenever a mouse button is released */
          mouseUp(event) {
               // Enable the controls
               this[s_controls].enabled = true;
               this[s_selectedObject] = null;
          }

     } //class DragControls

     return {
          DragControls: DragControls
     };
});

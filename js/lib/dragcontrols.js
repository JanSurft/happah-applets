//////////////////////////////////////////////////////////////////////////////
//
// Drag Controls implementation is based on script-tutorials.com.
// @url https://www.script-tutorials.com/webgl-with-three-js-lesson-10/
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', './happah', 'lib/util'], function($, THREE, happah, UTIL) {
     var s_camera = Symbol('camera');
     var s_scene = Symbol('scene');
     var s_controls = Symbol('controls');

     // Drag control variables
     var s_raycaster = Symbol('raycaster');
     //var s_selectedObject = Symbol('selected');
     var s_selectionPlane = Symbol('plane');
     var s_offset = Symbol('offset');
     var s_enabled = Symbol('enabled');
     var s_arrow = Symbol('arrow');

     class DragControls {

          constructor(scene, controls, camera) {
               // TODO: still necessary?
               this.mouseUp = this.mouseUp.bind(this);
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);

               // Initialize viewport variables
               this[s_scene] = scene;
               this[s_controls] = controls;
               this[s_camera] = camera;
               this[s_enabled] = true;

               // Initialize drag control variables
               this[s_raycaster] = new THREE.Raycaster();

               // Helper plane in which the objects will move
               // Attention: at any time, the plane must be bigger than the
               // dragged object or it won't work!
               // TODO: make the size a multiple of the impostor's radius!
               // TODO: don't make the plane a geometry
               this[s_selectionPlane] = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500), new THREE.MeshBasicMaterial({
                    color: 0x00EE22,
                    alphaTest: 0,
                    visible: false
               }));
               this[s_offset] = new THREE.Vector3();
               this[s_scene].add(this[s_selectionPlane]);
               this[s_selectionPlane].lookAt(this[s_camera].getWorldDirection());
          }

          enable() {
               this[s_enabled] = true;
          }

          disable() {
               this[s_enabled] = false;
          }

          listenTo(domElement) {
               domElement.addEventListener('mousemove', this.mouseMove, false);
               domElement.addEventListener('mouseup', this.mouseUp, false);
               domElement.addEventListener('mousedown', this.mouseDown, false);
          }

          stopListeningTo(domElement) {
               domElement.removeEventListener('mousemove', this.mouseMove, false);
               domElement.removeEventListener('mouseup', this.mouseUp, false);
               domElement.removeEventListener('mousedown', this.mouseDown, false);
          }

          /** Called when a mouse button is pressed */
          mouseDown(event) {
               event.preventDefault();

               if (this[s_enabled] == false) {
                    return;
               }
               // TODO: don't calculate the position every time.
               //       -> only on window resize...
               var elementPosition = UTIL.Util.getElementPosition(event.currentTarget);

               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);

               // Find all intersected objects
               var intersects = this[s_raycaster].intersectObjects(this[s_scene]._controlPointImpostors.children, true);

               if (intersects.length > 0) {
                    // Disable the controls
                    this[s_controls].enabled = false;

                    // Set the selection - first intersected object
                    //this[s_selectedObject] = intersects[0];
                    this.selectObject(intersects[0]);

                    // Calculate the offset
                    var intersects = this[s_raycaster].intersectObject(this[s_selectionPlane]);

                    this[s_offset].copy(intersects[0].point).sub(this[s_selectionPlane].position);
               }
          }

          selectObject(object) {
               //this[s_selectedObject] = object;
               this.selectedObject = object;
          }

          updatePosition(object, position) {
               object.position.copy(position);
          }

          /** Called whenever a mouse button is moved */
          mouseMove(event) {
               event.preventDefault();

               if (this[s_enabled] == false) {
                    return;
               }
               var elementPosition = UTIL.Util.getElementPosition(event.currentTarget);

               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;
               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

               // Get 3D vector from 3D mouse position using
               // 'unproject' function
               var vector = new THREE.Vector2(mouseX, mouseY);
               // vector.unproject(this[s_camera]);

               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);
               // Multiply the origin vector of the ray so it's far behind the camera
               // this[s_raycaster].ray.origin.sub(this[s_raycaster].ray.direction);
               // this[s_camera].position, vector.sub(this[s_camera].position).normalize());
               // ^Only in 3D.

               if (this.selectedObject) {
                    // Scene has changed so we need to redraw.
                    // TODO: this is causing bad behaviour with quickly
                    // drag+drop we need the viewport to update immediately.
                    this[s_scene].redraw();

                    // Check the position where the plane is intersected
                    var intersects = this[s_raycaster].intersectObject(this[s_selectionPlane]);

                    if (intersects[0] == null) {
                         console.log("Warning: lost selection plane!");
                         this.mouseUp();
                         return;
                    }

                    // Reposition the object based on the intersection point with the plane
                    //this[s_selectedObject].position.copy(intersects[0].point.sub(this[s_offset]));
                    this.updatePosition(this.selectedObject, intersects[0].point.sub(this[s_offset]));


                    this[s_selectionPlane].position.copy(this.selectedObject.position);
               } else {
                    // Update position of the plane if need
                    var intersects =
                         this[s_raycaster].intersectObjects(this[s_scene]._controlPointImpostors.children, true);
                    if (intersects.length > 0) {
                         // TODO: is this really necessary?
                         this[s_selectionPlane].position.copy(intersects[0].position);

                         // Update normal-vector
                         this[s_selectionPlane].lookAt(this[s_camera].position.clone().add(intersects[0].position));
                    }
               }
          }

          /** Called whenever a mouse button is released */
          mouseUp() {
               // Enable the controls
               this[s_controls].enabled = true;
               //this[s_selectedObject] = null;
               this.selectedObject = null;
          }

     } //class DragControls

     return {
          DragControls: DragControls
     };
});

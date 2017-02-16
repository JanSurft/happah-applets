//////////////////////////////////////////////////////////////////////////////
//
// Drag Controls implementation is based on script-tutorials.com.
// @url https://www.script-tutorials.com/webgl-with-three-js-lesson-10/
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', './util'], function($, THREE, UTIL) {
     var s_camera = Symbol('camera');
     var s_objects = Symbol('objects');
     var s_controls = Symbol('controls');

     // Drag control variables
     var s_raycaster = Symbol('raycaster');
     var s_enabled = Symbol('enabled');
     var s_arrow = Symbol('arrow');
     var s_selectionPlane = Symbol('selectionplane');
     var s_previousPoint = Symbol('previouspoint');

     class DragControls {
          /**
           * Objects needs to be an array of meshes.
           * NOTE: not an object3D!
           */
          constructor(objects = [], controls, camera) {
               this.mouseUp = this.mouseUp.bind(this);
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);

               // Initialize viewport variables
               this[s_objects] = objects;
               this[s_controls] = controls;
               this[s_camera] = camera;
               this[s_enabled] = true;

               // Initialize drag control variables
               this[s_raycaster] = new THREE.Raycaster();

               this[s_selectionPlane] = new THREE.Plane();
               this[s_previousPoint] = new THREE.Vector3();
          }

          enable() {
               this[s_enabled] = true;
          }

          disable() {
               this[s_enabled] = false;
          }

          addDragable(object) {
               this[s_objects].push(object);
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

               // Find all intersected objects
               var intersects = this[s_raycaster].intersectObjects(this[s_objects]);

               if (intersects.length > 0) {
                    // Disable the controls
                    this[s_controls].enabled = false;

                    // Set the selection - first intersected object
                    this.selectObject(intersects[0]);

                    // Calculate the offset
                    var intersectionPoint = this[s_raycaster].ray.intersectPlane(this[s_selectionPlane]);

                    this[s_previousPoint].copy(intersectionPoint.sub(intersects[0].position));
               }
          }

          selectObject(object) {
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
               // Get mouse position
               var vector2 = UTIL.Util.getPositionOnCanvas(event);
               var mouseVector = new THREE.Vector3(vector2.x, vector2.y, 0);

               // Get 3D vector from 3D mouse position using
               // 'unproject' function
               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);

               if (this.selectedObject) {
                    // Check the position where the plane is intersected
                    var intersectionPoint = this[s_raycaster].ray.intersectPlane(this[s_selectionPlane]);


                    // Reposition the object based on the intersection point with the plane
                    this.updatePosition(this.selectedObject, intersectionPoint.sub(this[s_previousPoint]));

                    // Update normal-vector of plane
                    this[s_selectionPlane].setFromNormalAndCoplanarPoint(this[s_camera].getWorldDirection(), this.selectedObject.position);

                    $.event.trigger({
                         type: "rebuildStoryboard",
                         message: "dragging controlpoint!"
                    });
               } else {
                    // Update position of the plane if need
                    var intersects = this[s_raycaster].intersectObjects(this[s_objects]);
                    if (intersects.length > 0) {

                         // Update normal-vector
                         this[s_selectionPlane].setFromNormalAndCoplanarPoint(this[s_camera].getWorldDirection(), intersects[0].position);

                    }
               }
          }

          /** Called whenever a mouse button is released */
          mouseUp() {
               // Enable the controls
               this[s_controls].enabled = true;
               this.selectedObject = null;
          }

     } //class DragControls

     return {
          DragControls: DragControls
     };
});

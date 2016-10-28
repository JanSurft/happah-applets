//////////////////////////////////////////////////////////////////////////////
//
// AddControls - for adding controlpoints to the scene
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', './spherical-impostor'], function($, THREE, happah) {
     var s_camera = Symbol('camera');
     var s_scene = Symbol('scene');
     var s_viewport = Symbol('viewport');
     var s_viewPlane = Symbol('viewplane');

     var s_addMode = Symbol('addMode');
     var s_isHead = Symbol('ishead');
     var s_limit = Symbol('limit');

     class AddControls {

          /** Limit of zero means infinite */
          constructor(viewport, scene, camera, limit = 0) {
               this.onMouseDoubleclick = this.onMouseDoubleclick.bind(this);
               this.onMouseClick = this.onMouseClick.bind(this);

               this[s_scene] = scene;
               this[s_limit] = limit;
               this[s_viewport] = viewport;
               this[s_addMode] = false;
               this[s_camera] = camera;
               this[s_viewPlane] = new THREE.Plane();
          }

          /** Force add mode */
          enterAddMode() {
               if (this[s_scene].controlPoints.length < this[s_limit] || this[s_limit] == 0) {
                    // Change cursor to crosshair
                    this[s_viewport].renderer.domElement.style.cursor = "crosshair";
                    this[s_addMode] = true;
               } else {
                    console.warn("Control-point limit reached!");
               }
          }

          /** Adds a control point to the scene */
          addControlPoints(points, head = false, color = new THREE.Color(0x888888)) {
               for (var i in points) {
                    var sphere = new happah.SphericalImpostor(3);
                    sphere.material.uniforms.diffuse.value.set(color);
                    sphere.position.copy(points[i]);

                    // Add the point to head/tail of the array
                    if (head) {
                         this[s_scene]._controlPointImpostors.children.unshift(sphere);
                         this[s_scene].controlPoints.unshift(points[i]);
                    } else {
                         this[s_scene]._controlPointImpostors.add(sphere);
                         this[s_scene].controlPoints.push(points[i]);
                    }
               }

               this[s_viewport].rebuildStoryboard();
          }

          /** Returns the position of an HTML element */
          getElementPosition(element) {
               var position = new THREE.Vector2(0, 0);

               while (element) {
                    position.x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                    position.y += (element.offsetTop - element.scrollTop + element.clientTop);
                    element = element.offsetParent;
               }
               return position
          }

          listenTo(domElement) {
               domElement.addEventListener('dblclick', this.onMouseDoubleclick, false);
               domElement.addEventListener('click', this.onMouseClick, false);
          }
          stopListening(domElement) {
               domElement.removeEventListener('dblclick', this.onMouseDoubleclick, false);
               domElement.removeEventListener('click', this.onMouseClick, false);
          }
          set limit(limit) {
               this[s_limit] = limit;
          }

          onMouseDoubleclick(event) {
               // Get current mouse position on screen
               var elementPosition = this.getElementPosition(event.currentTarget);

               var vector = new THREE.Vector2();
               vector.x = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
               vector.y = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

               // Create new raycaster from mouse position
               var raycaster = new THREE.Raycaster();
               raycaster.setFromCamera(vector, this[s_camera]);

               // Check if we hit a sphericalImpostor. If so, save the position
               // NOTE: only check for first and last impostor (head/tail)
               var impostors = this[s_scene]._controlPointImpostors.children;
               var headTail = [impostors[0], impostors[impostors.length - 1]];
               var intersects = raycaster.intersectObjects(headTail, true);
               if (intersects[0] == headTail[0]) {
                    // Dblclick on head
                    this[s_isHead] = true;
               } else {
                    this[s_isHead] = false;
               }

               // Toggle add mode
               if (intersects[0]) {
                    this.enterAddMode();
               }
          }

          onMouseClick(event) {
               if (this[s_addMode]) {
                    // Get current mouse position on screen
                    var elementPosition = this.getElementPosition(event.currentTarget);

                    var vector = new THREE.Vector2();
                    vector.x = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
                    vector.y = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

                    // Create new raycaster
                    var raycaster = new THREE.Raycaster();
                    raycaster.setFromCamera(vector, this[s_camera]);

                    // Intersect with impostors
                    var impostors = this[s_scene]._controlPointImpostors.children;
                    var intersects = raycaster.intersectObjects(impostors, true);

                    // Exit add mode.
                    if (intersects[0] || (this[s_scene].controlPoints.length >= this[s_limit] && this[s_limit] != 0)) {
                         this[s_addMode] = false;
                         this[s_viewport].renderer.domElement.style.cursor = "default";
                         return;
                    }

                    // Intersect with viewplane to create a new position
                    this[s_viewPlane].set(this[s_camera].getWorldDirection(), 0);
                    var position = raycaster.ray.intersectPlane(this[s_viewPlane]);

                    // Add a new point to the specified position
                    this.addControlPoints([position], this[s_isHead]);
               }
          }


     } //class Addcontrols

     return {
          AddControls: AddControls
     };
});

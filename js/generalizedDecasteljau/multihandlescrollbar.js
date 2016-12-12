//////////////////////////////////////////////////////////////////////////////
//
// Multi-handle-Scrollbar
// scrollbar with multiple handles in different colors
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'lib/happah', 'lib/util'], function($, THREE, HAPPAH, UTIL) {
     var s_handles = Symbol('handles');
     //var s_color = Symbol('color');
     //const default_handle_color = 0xE50A00;
     class MultiHandleScrollbar extends HAPPAH.Scrollbar {

               constructor(position, viewport) {
                    super(position, viewport);

                    //this[s_color] = default_handle_color;
                    this[s_handles] = [this.handle];
               }

               addHandle(value = 0.5, color) {
                    var handle = this.createHandle(value, color);

                    handle.value = value;
                    this[s_handles].push(handle);

                    // Add to scene
                    this.add(handle);

                    return handle;
               }

               removeHandles() {
                    // Remove them from the scene first
                    for (var i = 0; i < this[s_handles].length - 1; i++) {
                         this.remove(this[s_handles][i]);
                    }
                    this[s_handles] = [];
               }

               valueOf(index) {
                    if (index >= this[s_handles].length)
                         return -1;

                    return this[s_handles][index].value;
               }

               show(handle) {
                    this.add(handle);
               }

               hide(handle) {
                    this.remove(handle);
               }

               updateLines(handle) {
                    // Update color of line segments
                    this.remove(this.lineRight);
                    this.remove(this.lineLeft);

                    var geo = new THREE.Geometry();
                    geo.vertices.push(new THREE.Vector3(-75, 2, 0));
                    geo.vertices.push(handle.position);

                    var mat = new THREE.LineBasicMaterial({
                         color: handle.material.color,
                         linewidth: 5
                    });
                    this.lineLeft = new THREE.Line(geo, mat);
                    this.add(this.lineLeft);

                    geo = new THREE.Geometry();
                    geo.vertices.push(handle.position);
                    geo.vertices.push(new THREE.Vector3(75, 2, 0));

                    // TODO: color of previous handle/segment
                    mat = new THREE.LineBasicMaterial({
                         color: handle.material.color,
                         linewidth: 5
                    });
                    this.lineRight = new THREE.Line(geo, mat);
                    this.add(this.lineRight);
               }

               /** Called when a mouse button is pressed */
               mouseDown(event) {
                    event.preventDefault();

                    if (this.enabled == false) {
                         return;
                    }
                    // TODO: don't calculate the position every time.
                    //       -> only on window resize...
                    var elementPosition = UTIL.Util.getElementPosition(event.currentTarget);

                    // Get mouse position
                    var mouseX = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
                    var mouseY = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

                    var mouseVector = new THREE.Vector3(mouseX, mouseY, -1);

                    // Set up ray from mouse position
                    this.raycaster.setFromCamera(mouseVector, this.camera);

                    // Find all intersected objects
                    var intersects = this.raycaster.intersectObjects(this[s_handles]);

                    if (intersects.length > 0) {
                         // Update line colors if different handle
                         if (this.selectedObject != intersects[0].object) {
                              this.updateLines(intersects[0].object);
                         }
                         // Enable drag-mode
                         this.selectedObject = intersects[0].object;

                         // Disable the controls
                         this.controls.enabled = false;
                    } else {
                         this.selectedObject = false;
                    }
               }

               /** Called whenever a mouse button is moved */
               mouseMove(event) {
                    event.preventDefault();

                    if (this.enabled == false) {
                         return;
                    }
                    var elementPosition = UTIL.Util.getElementPosition(event.currentTarget);

                    // Get mouse position
                    var mouseX = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
                    var mouseY = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;
                    var mouseVector = new THREE.Vector3(mouseX, mouseY, -1);

                    // Set up ray from mouse position
                    this.raycaster.setFromCamera(mouseVector, this.camera);

                    if (this.selectedObject) {
                         // Reposition the object based on the intersection point with the plane
                         var newPos = this.selectionLine.closestPointToPoint(this.raycaster.ray.intersectPlane(this.selectionPlane));
                         newPos.sub(this.position);
                         //TODO: selectedobject.object???
                         this.selectedObject.position.copy(newPos);

                         // In case we are beyond the left border
                         if (this.handle.position.x < -75) {
                              // hide the black line
                              this.lineLeft.visible = false;
                         } else {
                              this.lineLeft.visible = true;
                         }
                         // Same goes for the right line
                         if (this.handle.position.x > 75) {
                              this.lineRight.visible = false;
                         } else {
                              this.lineRight.visible = true;
                         }

                         // Update our line sections
                         this.lineRight.geometry.verticesNeedUpdate = true;
                         this.lineLeft.geometry.verticesNeedUpdate = true;

                         // New value means new storyboard
                         this.viewport.rebuildStoryboard();
                    }
               }

          } //class MultiHandleScrollbar

     return {
          MultiHandleScrollbar: MultiHandleScrollbar
     };
});

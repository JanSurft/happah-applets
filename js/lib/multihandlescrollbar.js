//////////////////////////////////////////////////////////////////////////////
//
// Multi-handle-Scrollbar
// scrollbar with multiple handles in different colors
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah', '../lib/util'], function($, THREE, HAPPAH, UTIL) {
     var s_handles = Symbol('handles');

     class MultiHandleScrollbar extends HAPPAH.Scrollbar {

               constructor(position, viewport, initialValue) {
                    super(position, viewport, initialValue);

                    this[s_handles] = [this.handle];
               }

               addHandle(value = 0.5, color) {
                    var handle = this.createHandle(value, color);


                    handle.value = value;
                    this[s_handles].push(handle);

                    // Fix position offset from scrollbar
                    handle.position.setZ(this.position.z);

                    // Add to scene
                    this.add(handle);

                    return handle;
               }

               popHandle() {
                    var handle = this[s_handles].pop();
                    this.remove(handle);
                    return handle;
               }

               removeHandles() {
                    // Remove them from the scene first
                    for (var i = 0; i < this[s_handles].length - 1; i++) {
                         this.remove(this[s_handles][i]);
                    }
                    this[s_handles] = [];
               }

               // Deprecated
               valueOf(index) {
                    if (index >= this[s_handles].length)
                         return -1;

                    return this[s_handles][index].value;
               }

               // Deprecated
               show(handle) {
                    this.add(handle);
               }

               // Deprecated
               hide(handle) {
                    this.remove(handle);
               }

               // Deprecated
               get handles() {
                    return this[s_handles];
               }

               // @Override
               handle(i) {
                    return this[s_handles][i];
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
                    } else {
                         this.selectedObject = false;
                    }
                    $.event.trigger({
                         type: "draggingStarted",
                         message: "scrollbar dragging has started!"
                    });
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
                         $.event.trigger({
                              type: "dragging",
                              message: "scrollbar dragging started!"
                         });
                    }
               }

          } //class MultiHandleScrollbar

     return {
          MultiHandleScrollbar: MultiHandleScrollbar
     };
});

//////////////////////////////////////////////////////////////////////////////
//
// Two-handle-Scrollbar
// scrollbar with two handles in different colors
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', './happah', './util'], function($, THREE, HAPPAH, UTIL) {
     var s_handles = Symbol('handles');
     var s_lineMiddle = Symbol('linemiddle');
     const left_segment_color = 0x54334f;
     const middle_segment_color = 0x00dd00;
     const right_segment_color = 0x0000dd;

     class TwoHandleScrollbar extends HAPPAH.Scrollbar {

               constructor(position, viewport, initialValue) {
                    super(position, viewport, initialValue);

                    this[s_handles] = [this.handle];
                    this.addHandle(0.8, 0x3d3d3d);

                    // Re-Setup lines:
                    // left goes from 0 to first handle
                    // middle goes from first handle to second handle
                    // right goes from second handle to 1
                    var lineGeo = new THREE.Geometry();
                    lineGeo.vertices.push(this[s_handles][0].position);
                    lineGeo.vertices.push(this[s_handles][1].position);

                    var lineMat = new THREE.LineBasicMaterial({
                         color: middle_segment_color,
                         linewidth: 5
                    });
                    this[s_lineMiddle] = new THREE.Line(lineGeo, lineMat);
                    this.add(this[s_lineMiddle]);

                    this.lineRight.geometry.vertices[1] = this[s_handles][1].position;

                    // Colors may have changed
                    this.lineRight.material.color.set(right_segment_color);
                    this.lineLeft.material.color.set(left_segment_color);
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

               get handles() {
                    return this[s_handles];
               }

               updateLines(handle) {
                    this.lineLeft.geometry.vertices[0] = this[s_handles][0].position;
                    this.lineRight.geometry.vertices[1] = this[s_handles][1].position;
                    this[s_lineMiddle].geometry.vertices = [this[s_handles][0].position, this[s_handles][1].position];

                    this.lineLeft.geometry.verticesNeedUpdate = true;
                    this.lineRight.geometry.verticesNeedUpdate = true;
                    this[s_lineMiddle].geometry.verticesNeedUpdate = true;
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
                         // Enable drag-mode
                         this.selectedObject = intersects[0].object;

                         // Disable the controls
                         //this.controls.enabled = false;
                         $.event.trigger({
                              type: "draggingStarted",
                              message: "scrollbar dragging started!"
                         });
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

                         // Update line segments
                         this.updateLines();

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
                         //this.viewport.rebuildStoryboard();
                         $.event.trigger({
                              type: "dragging",
                              message: "scrollbar dragging!"
                         });
                    }
               }

          } //class TwoHandleScrollbar

     return {
          TwoHandleScrollbar: TwoHandleScrollbar
     };
});

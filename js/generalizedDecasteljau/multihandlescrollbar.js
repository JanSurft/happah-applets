//////////////////////////////////////////////////////////////////////////////
//
// Multi-handle-Scrollbar
// scrollbar with multiple handles in different colors
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'lib/happah'], function($, THREE, HAPPAH) {
     var s_handles = Symbol('handles');
     var s_color = Symbol('color');

     class MultiHandleScrollbar extends HAPPAH.Scrollbar {

               constructor(position, viewport) {
                    super(position, viewport);

                    this[s_color] = 0xE50A00;
                    this[s_handles] = [this.handle];
               }

               addHandle() {
                    var geo = new THREE.BoxGeometry(4, 8, 8);

                    // Increase color value to be visually different
                    this[s_color] += 0x0E4534;
                    var mat = new THREE.MeshBasicMaterial({
                         color: this[s_color]
                    });
                    // Increase color value

                    var handle = new THREE.Mesh(geo, mat);
                    this[s_handles].push(handle);

                    // Add to scene
                    this.add(handle);

                    // Return the color of the new handle
                    return this[s_color];
               }

               value(index) {
                    if (index >= this[s_handles].length)
                         return -1;

                    var handle = this[s_handles][index];
                    return (handle.position.x / 150) + 0.5;
               }

               /** Called when a mouse button is pressed */
               mouseDown(event) {
                    event.preventDefault();

                    if (this.enabled == false) {
                         return;
                    }
                    // TODO: don't calculate the position every time.
                    //       -> only on window resize...
                    var elementPosition = this.getElementPosition(event.currentTarget);

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
                    var elementPosition = this.getElementPosition(event.currentTarget);

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

                         // In case we are beyond the leftVec
                         if (this.handle.position.x < this.leftVec.x) {
                              // hide the black line
                              this.lineLeft.visible = false;
                         } else {
                              this.lineLeft.visible = true;
                         }
                         // Same goes for the right line
                         if (this.handle.position.x > this.rightVec.x) {
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

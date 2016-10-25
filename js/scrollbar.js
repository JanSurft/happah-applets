//////////////////////////////////////////////////////////////////////////////
//
// Scrollbar
// Creates and handles a scrollbar with a drag-and-drop handle
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'spherical-impostor'], function($, THREE, happah) {
     var s_camera = Symbol('camera');
     var s_controls = Symbol('controls');
     var s_raycaster = Symbol('raycaster');
     var s_selectionPlane = Symbol('plane');
     var s_selectionLine = Symbol('line');
     var s_selectedObject = Symbol('selectedobject');
     var s_enabled = Symbol('enabled');
     var s_handle = Symbol('handle');
     var s_value = Symbol('value');
     var s_viewport = Symbol('viewport');
     var s_rightVec = Symbol('rightvec');
     var s_leftVec = Symbol('leftvec');
     var s_lineRight = Symbol('lineright');
     var s_lineLeft = Symbol('lineleft');

     class Scrollbar extends THREE.Object3D {

               constructor(position, viewport) {
                    super();

                    this.mouseDown = this.mouseDown.bind(this);
                    this.mouseMove = this.mouseMove.bind(this);
                    this.mouseUp = this.mouseUp.bind(this);

                    this[s_controls] = viewport.controls;

                    // TODO: remove reference to camera
                    // we assume this is only used in an overlay so the
                    // direction is always straight down
                    this[s_camera] = viewport.overlayCam;
                    this[s_enabled] = true;
                    this[s_value] = 0.5;

                    // TODO: remove reference to viewport
                    this[s_viewport] = viewport;

                    this[s_raycaster] = new THREE.Raycaster();

                    // Axis-arrow geometry
                    var geo = new THREE.CylinderGeometry(1, 1, 150, 32);
                    var coneGeometry = new THREE.CylinderGeometry(0, 3, 8, 5, 1);
                    var boxGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
                    var textGeo = new THREE.Geometry();

                    var characterSize = 1.4;
                    var offset = (characterSize * 3) / 2;
                    textGeo = geomify('0', characterSize);
                    textGeo.translate(-75 - offset, 5, 0);
                    coneGeometry.rotateZ(-(Math.PI / 2));
                    coneGeometry.translate(79, 0, 0);
                    geo.rotateZ(Math.PI / 2);
                    geo.merge(textGeo);
                    textGeo = geomify('1', characterSize);
                    textGeo.translate(75 - offset, 5, 0);
                    geo.merge(textGeo);
                    geo.merge(coneGeometry);
                    boxGeometry.translate(-75, 0, 0);
                    geo.merge(boxGeometry);
                    boxGeometry.translate(75, 0, 0);
                    geo.merge(boxGeometry);
                    geo.rotateX(3 * Math.PI / 2);
                    var mat = new THREE.MeshBasicMaterial({
                         color: 0x4D4D4D
                    });
                    var bar = new THREE.Mesh(geo, mat);
                    bar.position.set(0, 0, 0);

                    // Handle to move along the scrollbar
                    var boxGeometry = new THREE.BoxGeometry(4, 8, 8);
                    var boxMaterial = new THREE.MeshBasicMaterial({
                         color: 0x5d5d5d
                    });
                    this[s_handle] = new THREE.Mesh(boxGeometry, boxMaterial);
                    this[s_handle].position.set(0, 6, 0);

                    // Sections to devide interval into separate colors
                    this[s_leftVec] = new THREE.Vector3(-75, 6, 0);
                    this[s_rightVec] = new THREE.Vector3(75, 6, 0);
                    var lineGeo = new THREE.Geometry();
                    var lineMat = new THREE.LineBasicMaterial({
                         color: 0xFF0000,
                         linewidth: 5
                    });

                    lineGeo.vertices.push(this[s_rightVec]);
                    lineGeo.vertices.push(this[s_handle].position);

                    this[s_lineRight] = new THREE.Line(lineGeo, lineMat);

                    var lineGeo2 = new THREE.Geometry();
                    lineGeo2.vertices.push(this[s_handle].position);
                    lineGeo2.vertices.push(this[s_leftVec]);
                    lineMat = new THREE.LineBasicMaterial({
                         color: 0x000000,
                         linewidth: 5
                    });
                    this[s_lineLeft] = new THREE.Line(lineGeo2, lineMat);
                    this[s_lineRight].geometry.verticesNeedUpdate = true;

                    this[s_selectionPlane] = new THREE.Plane(new THREE.Vector3(0, 10, 0), 0);


                    // Add meshes to container
                    this.add(this[s_lineRight]);
                    this.add(this[s_lineLeft]);
                    this.add(this[s_handle]);
                    //this.add(this[s_selectionLine]);
                    this.add(bar);
                    this.position.copy((position != null) ? position : new THREE.Vector3());
                    this[s_leftVec] = this.position.clone().add(this[s_leftVec]);
                    this[s_rightVec] = this.position.clone().add(this[s_rightVec]);
                    this[s_selectionLine] = new THREE.Line3(this[s_leftVec],
                         this[s_rightVec]);

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
                    this[s_handle].position.setX(-75 + (150 * value));
               }
               listenTo(domElement) {
                    domElement.addEventListener('mousedown', this.mouseDown, false);
                    domElement.addEventListener('mouseup', this.mouseUp, false);
                    domElement.addEventListener('mousemove', this.mouseMove, false);
               }
               stopListening(domElement) {
                    domElement.removeEventListener('mousedown', this.mouseDown, false);
                    domElement.removeEventListener('mouseup', this.mouseUp, false);
                    domElement.removeEventListener('mousemove', this.mouseMove, false);
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

                    // Set up ray from mouse position
                    this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);

                    // Find all intersected objects
                    var intersects = this[s_raycaster].intersectObject(this[s_handle]);

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
                    this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);

                    if (this[s_selectedObject]) {
                         // Reposition the object based on the intersection point with the plane
                         var newPos = this[s_selectionLine].closestPointToPoint(this[s_raycaster].ray.intersectPlane(this[s_selectionPlane]));
                         newPos.sub(this.position);
                         this[s_handle].position.copy(newPos);

                         // Update scrollbar value
                         this[s_value] = (newPos.x / 150) + 0.5;

                         // In case we are beyond the leftVec
                         if (this[s_handle].position.x < this[s_leftVec].x) {
                              // hide the black line
                              this[s_lineLeft].visible = false;
                         } else {
                              this[s_lineLeft].visible = true;
                         }
                         // Same goes for the right line
                         if (this[s_handle].position.x > this[s_rightVec].x) {
                              this[s_lineRight].visible = false;
                         } else {
                              this[s_lineRight].visible = true;
                         }

                         // Update our line sections
                         this[s_lineRight].geometry.verticesNeedUpdate = true;
                         this[s_lineLeft].geometry.verticesNeedUpdate = true;

                         // New value means new storyboard
                         this[s_viewport].rebuildStoryboard();
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

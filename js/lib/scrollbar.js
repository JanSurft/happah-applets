//////////////////////////////////////////////////////////////////////////////
//
// Scrollbar
// Creates and handles a scrollbar with a drag-and-drop handle
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'lib/util'], function($, THREE, UTIL) {
     var s_camera = Symbol('camera');
     var s_controls = Symbol('controls');
     //var s_raycaster = Symbol('raycaster');
     var s_selectionPlane = Symbol('plane');
     var s_selectionLine = Symbol('line');
     var s_selectedObject = Symbol('selectedobject');
     //var s_enabled = Symbol('enabled');
     //var s_handle = Symbol('handle');
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

                    this.controls = viewport.controls;

                    // TODO: remove reference to camera
                    // we assume this is only used in an overlay so the
                    // direction is always straight down
                    this.camera = viewport.overlayCam;
                    //this[s_enabled] = true;
                    this.enabled = true;

                    // TODO: remove reference to viewport
                    this.viewport = viewport;

                    this.raycaster = new THREE.Raycaster();

                    // Axis-arrow geometry
                    var geo = new THREE.CylinderGeometry(1, 1, 155, 32);
                    var coneGeometry = new THREE.CylinderGeometry(0, 3, 8, 5, 1);
                    var boxGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);

                    var characterSize = 1.4;
                    var offset = (characterSize * 3) / 2;
                    coneGeometry.rotateZ(-(Math.PI / 2));
                    coneGeometry.translate(85, 0, 0);
                    geo.rotateZ(Math.PI / 2);
                    geo.translate(5, 0, 0);
                    geo.merge(coneGeometry);
                    boxGeometry.translate(-75, 0, 3);
                    geo.merge(boxGeometry);
                    boxGeometry.translate(150, 0, 3);
                    geo.merge(boxGeometry);
                    geo.rotateX(3 * Math.PI / 2);
                    var mat = new THREE.MeshBasicMaterial({
                         color: 0x4D4D4D
                    });
                    var bar = new THREE.Mesh(geo, mat);
                    bar.position.set(0, 0, 0);

                    // Handle to move along the scrollbar
                    //var boxGeometry = new THREE.BoxGeometry(4, 8, 8);
                    //var boxMaterial = new THREE.MeshBasicMaterial({
                    //color: 0x5d5d5d
                    //});
                    //this.handle = new THREE.Mesh(boxGeometry, boxMaterial);
                    //this.handle.position.set(0, 6, 0);
                    this.handle = new Handle(0.5, 0x5D5D5D);

                    // Sections to devide interval into separate colors
                    this.leftVec = new THREE.Vector3(-75, 2, 0);
                    this.rightVec = new THREE.Vector3(75, 2, 0);
                    var lineGeo = new THREE.Geometry();
                    var lineMat = new THREE.LineBasicMaterial({
                         color: 0xFF0000,
                         linewidth: 5
                    });


                    lineGeo.vertices.push(this.rightVec);
                    lineGeo.vertices.push(this.handle.position);

                    this.lineRight = new THREE.Line(lineGeo, lineMat);

                    var lineGeo2 = new THREE.Geometry();
                    lineGeo2.vertices.push(this.handle.position);
                    lineGeo2.vertices.push(this.leftVec);
                    lineMat = new THREE.LineBasicMaterial({
                         color: 0x000000,
                         linewidth: 5
                    });
                    this.lineLeft = new THREE.Line(lineGeo2, lineMat);
                    this.lineRight.geometry.verticesNeedUpdate = true;

                    this.selectionPlane = new THREE.Plane(new THREE.Vector3(0, 10, 0), 0);


                    // Add meshes to container
                    this.add(this.lineRight);
                    this.add(this.lineLeft);
                    this.add(this.handle);
                    //this.add(this.selectionLine);
                    this.add(bar);
                    this.position.copy((position != null) ? position : new THREE.Vector3());
                    this.leftVec = this.position.clone().add(this.leftVec);
                    this.rightVec = this.position.clone().add(this.rightVec);
                    this.selectionLine = new THREE.Line3(this.leftVec,
                         this.rightVec);

                    // Labels
                    this.viewport.labelManager.addLabel("0", this.leftVec.setX(this.leftVec.x + 5), "overlay", true);
                    this.viewport.labelManager.addLabel("1", this.rightVec.setX(this.rightVec.x + 5), "overlay", true);
               }
               enable() {
                    //this[s_enabled] = true;
                    this.enabled = true;
               }
               disable() {
                    //this[s_enabled] = false;
                    this.enabled = false;
               }
               get value() {
                    return this.handle.value;
               }
               set value(value) {
                    this.handle.position.setX(-75 + (150 * value));
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
                    var intersects = this.raycaster.intersectObject(this.handle);

                    if (intersects.length > 0) {
                         // Enable drag-mode
                         this.selectedObject = true;

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
                         this.handle.position.copy(newPos);

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

               /** Called whenever a mouse button is released */
               mouseUp() {
                    // Enable the controls
                    this.controls.enabled = true;
                    this.selectedObject = false;
               }

               createHandle(position, color) {
                    return new Handle(position, color);
               }

          } //class Scrollbar

     class Handle extends THREE.Mesh {
               constructor(position, color) {
                    var geo = new THREE.BoxGeometry(4, 8, 8);
                    var mat = new THREE.MeshBasicMaterial({
                         color: color
                    });
                    super(geo, mat);

                    // Apply the position
                    this.position.setX((position / 150) + 0.5);
                    this.position.setY(6);
               }

               get color() {
                    return this.material.color;
               }

               get value() {
                    return (this.position.x / 150) + 0.5;
               }

               set value(value) {
                    this.position.setX(-75 + (150 * value));
               }

          } // Class Handle

     return {
          Scrollbar: Scrollbar
     };
});

//////////////////////////////////////////////////////////////////////////////
//
// Scrollbar
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', 'dragcontrols', 'trackballcontrols', 'spherical-impostor'], function($, THREE, THREE, happah, happah2, happah3) {
     var s_camera = Symbol('camera');
     var s_scene = Symbol('scene');
     var s_controls = Symbol('controls');

     // Drag control variables
     var s_raycaster = Symbol('raycaster');
     var s_axisLine = Symbol('line');
     var s_selectionPlane = Symbol('plane');
     var s_selectionLine = Symbol('line');
     var s_selectedObject = Symbol('selectedobject');
     var s_offset = Symbol('offset');
     var s_enabled = Symbol('enabled');

     // For testing purposes only
     var s_bar = Symbol('bar');
     var s_ball = Symbol('ball');
     var s_canvas = Symbol('canvas');

     class Scrollbar {

          constructor(scene, controls, camera, canvas) {
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);
               this.mouseUp = this.mouseUp.bind(this);

               this[s_canvas] = canvas;
               this[s_scene] = scene;
               this[s_controls] = controls;
               this[s_camera] = camera;
               this[s_enabled] = false;

               this[s_raycaster] = new THREE.Raycaster();


               // -------- TEST BAR --------
               var geo = new THREE.CylinderGeometry(1, 1, 350, 32);
               var coneGeometry = new THREE.CylinderGeometry(0, 3, 8, 5, 1);
               var boxGeometry = new THREE.BoxGeometry(1.5, 4, 1.5);
               var textGeo = new THREE.Geometry();
               // TODO: use textGeometry!!!
               textGeo = geomify('0');
               textGeo.translate(-1.5, 5, 0);
               coneGeometry.rotateZ(-(Math.PI / 2));
               coneGeometry.translate(175, 0, 0);
               geo.rotateZ(Math.PI / 2);
               geo.merge(textGeo);
               textGeo = geomify('1');
               textGeo.translate(150 - 0.5, 5, 0);
               geo.merge(textGeo);
               textGeo = geomify('-1');
               textGeo.translate(-151, 5, 0);
               geo.merge(textGeo);
               geo.merge(coneGeometry);
               geo.merge(boxGeometry);
               boxGeometry.translate(150, 0, 0);
               geo.merge(boxGeometry);
               boxGeometry.translate(-300, 0, 0);
               geo.merge(boxGeometry);
               var mat = new THREE.MeshBasicMaterial({
                    color: 0x4D4D4D
               });
               this[s_bar] = new THREE.Mesh(geo, mat);
               this[s_bar].position.set(0, -($(canvas).height() / 6), -0.3);
               //mes.position.applyMatrix4(this[s_camera].matrixWorld);
               this[s_ball] = new happah3.SphericalImpostor(20);
               this[s_ball].material.uniforms.diffuse.value.set(0xff5555);
               this[s_ball].position.set(-120, -($(canvas).height() / 6), 2);
               this[s_camera].add(this[s_bar]);
               this[s_camera].add(this[s_ball]);
               // -------- TEST BAR --------

               // for camera space selection
               this[s_selectionPlane] = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({
                    color: 0x33ee77,
                    alphaTest: 0,
                    visible: true
               }));
               this[s_scene].add(this[s_selectionPlane]);
               this[s_selectionLine] = new THREE.Line(new THREE.Vector3(-175, 0, 0),
                    new THREE.Vector3(175, 0, 0));
               this[s_camera].add(this[s_selectionLine]);
               this[s_scene].add(this[s_camera]);
               this[s_offset] = new THREE.Vector3();
               //this[s_scene].add(this[s_selectionPlane]);
               //this[s_selectionPlane].lookAt(this[s_camera].position);
          }
          enable() {
               this[s_enabled] = true;
          }
          disable() {
               this[s_enabled] = false;
          }

          /** Returns the position of our HTML element */
          getElementPosition(element) {
               var position = new THREE.Vector2(0, 0);

               while (element) {
                    //console.log("parent: " + element.className);
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

               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

               // Not needed because the camera orientation does not change.
               //this[s_selectionPlane].lookAt(this[s_camera].position);

               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);

               // Get 3D vector from 3D mouse position using 'unproject'
               // Only in 3D.

               // Set the raycaster position // TODO: only in 3D?
               //this[s_raycaster].set(this[s_camera].position, vector.sub(this[s_camera].position).normalize());

               // Find all intersected objects
               var intersects = this[s_raycaster].intersectObjects(this[s_ball]);

               if (intersects.length > 0) {
                    console.log("ball selected!");

                    // Disable the controls
                    this[s_controls].enabled = false;

                    // Set the selection - first intersected object
                    //this[s_selectedObject] = intersects[0];

                    // Calculate the offset
                    var intersects = this[s_raycaster].intersectObject(this[s_selectionPlane]);

                    this[s_offset].copy(intersects[0].point).sub(this[s_selectionPlane].position);
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
                    var intersects = this[s_raycaster].intersectObject(this[s_selectionPlane]);

                    if (intersects[0] == null) {
                         console.log("Warning: lost selection plane!");
                         this.mouseUp();
                         return;
                    }

                    // Reposition the object based on the intersection point with the plane
                    var newPos = this[s_selectionLine].closestPointToPoint(intersects[0].point.sub(this[s_offset]));
                    this[s_selectedObject].copy(newPos);

                    // Update the plane's position
                    this[s_selectionPlane].position.copy(this[s_selectedObject].position);
               } else {
                    // Update position of the plane if need
                    var intersects =
                         this[s_raycaster].intersectObjects(this[s_ball], true);
                    if (intersects.length > 0) {
                         // TODO: is this really necessary?
                         this[s_selectionPlane].position.copy(intersects[0].position);
                         //this[s_selectionPlane].lookAt(this[s_camera].position);
                    }
               }
          }

          /** Called whenever a mouse button is released */
          mouseUp() {
               // Enable the controls
               this[s_controls].enabled = true;
               this[s_selectedObject] = null;
          }

     } //class Scrollbar

     return {
          Scrollbar: Scrollbar
     };
});

//////////////////////////////////////////////////////////////////////////////
//
// Drag Controls implementation is based on script-tutorials.com.
// @url https://www.script-tutorials.com/webgl-with-three-js-lesson-10/
// @author Tarek Wilkening (tarek_wilkening@web.de)
// TODO: Export drag controls into separate file.
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', 'TransformControls', 'DragControls'], function($, THREE) {
     var s_camera = Symbol('camera');
     //var s_dragControls = Symbol('dragControls');
     var s_renderer = Symbol('renderer');
     var s_scene = Symbol('scene');
     var s_trackballControls = Symbol('trackballControls');
     var s_transformControls = Symbol('transformControls');

     /**************************
      * Drag control variables
      * ************************/
     var s_raycaster = Symbol('raycaster');
     var s_selectedObject = Symbol('selected');
     var s_selectionPlane = Symbol('plane');
     var s_offset = Symbol('offset');

     // TEST TEST TETEST
     var s_sphere = Symbol('sphere');

     class Viewport {

          constructor(canvas, scene) {
               this.mouseUp = this.mouseUp.bind(this);
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);
               this.mouseWheel = this.mouseWheel.bind(this);
               var _this = this;

               this[s_scene] = scene;
               $(this[s_scene]).bind('update.happah', function() {
                    _this.update();
               });

               var context = canvas.getContext('webgl2');
               context.getExtension('EXT_frag_depth');
               var parameters = {
                    canvas: canvas,
                    context: context
               };
               this[s_renderer] = new THREE.WebGLRenderer(parameters);
               this[s_renderer].setClearColor(0xFFFFFF); //TODO: can renderer and viewport be separated?
               this[s_renderer].setSize($(canvas).width(), $(canvas).height());
               //this[s_camera] = new THREE.PerspectiveCamera(75, $(canvas).width() / $(canvas).height(), 0.1, 1000);

               this[s_camera] = new THREE.OrthographicCamera($(canvas).width() / -2, $(canvas).width() / 2, $(canvas).height() / 2, $(canvas).height() / -2, -500, 1000);
               this[s_camera].position.z = 0;
               this[s_camera].position.y = 10;
               this[s_camera].position.x = 0;
               this[s_camera].lookAt(scene.position);
               this[s_camera].zoom = 2.5;
               this[s_camera].updateProjectionMatrix();

               /*************************
                * Initialize drag control
                * variables
                * **********************/
               this[s_raycaster] = new THREE.Raycaster();
               // TODO: why can we select and move the plane even though it's invisible?
               this[s_selectionPlane] = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({
                    color: 0x00ee22,
                    alphaTest: 0,
                    visible: false
               }));
               this[s_offset] = new THREE.Vector3();
               this[s_scene].add(this[s_selectionPlane]);
               this[s_selectionPlane].lookAt(this[s_camera].position);

               // Sphere for testing
               var geo = new THREE.SphereGeometry(5, 32, 32);
               var mat = new THREE.MeshBasicMaterial({
                    color: 0xdd2222
               });
               this[s_sphere] = [];
               this[s_sphere].push(new THREE.Mesh(geo, mat));
               this[s_scene].add(this[s_sphere][0]);

               this[s_trackballControls] = new THREE.TrackballControls(this[s_camera], this[s_renderer].domElement);
               this[s_trackballControls].target.set(0, 0, 0);
               this[s_trackballControls].noZoom = true;
               this[s_renderer].domElement.addEventListener('mousemove', this[s_trackballControls].onDocumentMouseMove, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_trackballControls].onDocumentMouseDown, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_trackballControls].onDocumentMouseUp, false);

               /************************
                * Drag control listeners
                * *********************/
               this[s_renderer].domElement.addEventListener('mousemove', this.mouseMove, false);
               this[s_renderer].domElement.addEventListener('mouseup', this.mouseUp, false);
               this[s_renderer].domElement.addEventListener('mousedown', this.mouseDown, false);

               /************************
                * Mouse wheel listeners
                * *********************/
               this[s_renderer].domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
               this[s_renderer].domElement.addEventListener('mousewheel', this.mouseWheel, false);

               this[s_transformControls] = new THREE.TransformControls(this[s_camera], this[s_renderer].domElement);
               this[s_scene].add(this[s_transformControls]);
          }

          /**
           * Returns the position of our HTML element
           */
          getElementPosition(element) {
               var position = new THREE.Vector2(0, 0);

               while (element) {
                    position.x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                    position.y += (element.offsetTop - element.scrollTop + element.clientTop);
                    element = element.offsetParent;
               }
               return position;
          }

          mouseWheel(event) {
               event.preventDefault();

               var delta;

               if (event.wheelDelta) {
                    delta = event.wheelDeltaY / 35;
               } else if (event.detail) {
                    // This works in Firefox
                    delta = -event.detail / 2;
               } else {
                    delta = 0;
               }
               delta = delta * 0.06;

               if (this[s_camera].zoom + delta < 0) {
                    delta = 0;
               }
               this[s_camera].zoom += delta;
               this[s_camera].updateProjectionMatrix();
          }

          mouseDown(event) {
               event.preventDefault();
               // TODO: don't calculate the position every time.
               var elementPosition = this.getElementPosition(this[s_renderer].domElement);
               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / this[s_renderer].domElement.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / this[s_renderer].domElement.height) * 2 + 1;

               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

               // Not needed because the camera orientation does not change.
               //this[s_selectionPlane].lookAt(this[s_camera].position);

               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);

               // Get 3D vector from 3D mouse position using 'unproject'
               // Only in 3D.

               // Set the raycaster position // TODO: only in 3D?
               //this[s_raycaster].set(this[s_camera].position, vector.sub(this[s_camera].position).normalize());

               // Find all intersected objects
               var intersects = this[s_raycaster].intersectObjects(this[s_sphere], true);
               console.log(intersects);
               console.log(intersects[0].object.position);

               if (intersects.length > 0) {
                    console.log(intersects[0]);
                    // Disable the controls
                    this[s_trackballControls].enabled = false;

                    // Set the selection - first intersected object
                    this[s_selectedObject] = intersects[0].object;

                    // Calculate the offset
                    var intersects = this[s_raycaster].intersectObject(this[s_selectionPlane]);
                    this[s_offset].copy(intersects[0].point).sub(this[s_selectionPlane].position);
               }
          }

          mouseMove(event) {
               event.preventDefault();
               var elementPosition = this.getElementPosition(this[s_renderer].domElement);

               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / this[s_renderer].domElement.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / this[s_renderer].domElement.height) * 2 + 1;
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
                    var intersects =
                         this[s_raycaster].intersectObject(this[s_selectionPlane]);
                    // Reposition the object based on the intersection point with the plane
                    this[s_selectedObject].position.copy(intersects[0].point.sub(this[s_offset]));

                    this[s_selectionPlane].position.copy(this[s_selectedObject].position);
               } else {
                    // Update position of the plane if need
                    var intersects =
                         this[s_raycaster].intersectObjects(this[s_sphere], true);
                    if (intersects.length > 0) {
                         // TODO: is this really necessary?
                         this[s_selectionPlane].position.copy(intersects[0].object.position);
                         //         this[s_selectionPlane].lookAt(this[s_camera].position);
                    }
               }
          }

          mouseUp(event) {
               // Enable the controls
               this[s_trackballControls].enabled = true;
               this[s_selectedObject] = null;
          }

          update() { //TODO: make update private
               var hiding;
               var _this = this;

               function hideTransform() {
                    hiding = setTimeout(function() {
                         _this[s_transformControls].detach(_this[s_transformControls].object);
                    }, 2500)
               }

               function cancelHideTransform() {
                    if (hiding) clearTimeout(hiding);
               }

               function delayHideTransform() {
                         cancelHideTransform();
                         hideTransform();
                    }
                    /*
                    //this[s_dragControls] = new THREE.DragControls(this[s_camera], this[s_scene].controlPointImpostors.children, this[s_renderer].domElement);
                    this[s_dragControls].on('hoveron', function(e) {
                         _this[s_transformControls].attach(e.object);
                         cancelHideTransform();
                    });
                    this[s_dragControls].on('hoveroff', function(e) {
                         if (e) delayHideTransform();
                    });
                    */
               this[s_trackballControls].addEventListener('start', cancelHideTransform);
               this[s_trackballControls].addEventListener('end', delayHideTransform);
          }

          animate() {
               requestAnimationFrame(this.animate.bind(this));
               this[s_scene].animate();
               this[s_renderer].render(this[s_scene], this[s_camera]);
               this[s_trackballControls].update();
               this[s_transformControls].update();
          }

     } //class Viewport

     return {
          Viewport: Viewport
     };
});

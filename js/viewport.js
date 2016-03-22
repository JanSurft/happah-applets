//////////////////////////////////////////////////////////////////////////////
//
// Drag Controls implementation is based on script-tutorials.com.
// @url https://www.script-tutorials.com/webgl-with-three-js-lesson-10/
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', 'TransformControls', 'DragControls'], function($, THREE) {
     var s_camera = Symbol('camera');
     var s_dragControls = Symbol('dragControls');
     var s_renderer = Symbol('renderer');
     var s_scene = Symbol('scene');
     var s_trackballControls = Symbol('trackballControls');
     var s_transformControls = Symbol('transformControls');
     /**************************
      * Temporary variable only
      * ************************/
     var s_raycaster = Symbol('raycaster');
     var s_selectedObject = Symbol('selected');
     var s_selectionPlane = Symbol('plane');
     var s_offset = Symbol('offset');
     var s_mouseDown = Symbol('mousedown');
     var s_mouseMove = Symbol('mousemove');
     var s_mouseUp = Symbol('mouseup');
     var s_impostor = Symbol('impostor');
     var s_impostors = Symbol('impostors');

     class Viewport {

          constructor(canvas, scene) {
               this.mouseUp = this.mouseUp.bind(this);
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);
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
               /*************************
                * Temporary
                * **********************/
               this[s_raycaster] = new THREE.Raycaster();
               this[s_selectionPlane] = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8), new THREE.MeshBasicMaterial({
                    color: 0x00ee22,
                    alphaTest: 0,
                    visible: true
               }));
               //this[s_selectionPlane].lookAt(this[s_camera].position);
               this[s_impostor] = new THREE.Vector3();

               // Objects we want to intersect with our ray
               this[s_impostors] = this[s_scene]._controlPointImpostors.children;

               this[s_offset] = new THREE.Vector3();
               this[s_scene].add(this[s_selectionPlane]);

               this[s_camera].updateProjectionMatrix();

               this[s_trackballControls] = new THREE.TrackballControls(this[s_camera], this[s_renderer].domElement);
               this[s_trackballControls].target.set(0, 0, 0);
               this[s_trackballControls].noZoom = true;
               this[s_renderer].domElement.addEventListener('mousemove', this[s_trackballControls].onDocumentMouseMove, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_trackballControls].onDocumentMouseDown, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_trackballControls].onDocumentMouseUp, false);

               /************************
                * Temporary
                * *********************/
               this[s_renderer].domElement.addEventListener('mousemove', this.mouseMove, false);
               this[s_renderer].domElement.addEventListener('mouseup', this.mouseUp, false);
               this[s_renderer].domElement.addEventListener('mousedown', this.mouseDown, false);

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

          mouseDown(event) {
               // console.log(this[s_scene].controlPointImpostors.children);
               var element = $('.hph-canvas');

               var elementPosition = this.getElementPosition(this[s_renderer].domElement);
               // Get mouse position
               var mouseX = ((event.clientX - elementPosition.x) / this[s_renderer].domElement.width) * 2 - 1;
               var mouseY = -((event.clientY - elementPosition.y) / this[s_renderer].domElement.height) * 2 + 1;
               //var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
               //var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
               console.log("x=" + mouseX + " y=" + mouseY);
               var mouseVector = new THREE.Vector3(mouseX, mouseY, 0);
               this[s_selectionPlane].lookAt(this[s_camera].position);

               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);

               // Get 3D vector from 3D mouse position using 'unproject'
               // function
               //mouseVector.unproject(this[s_camera]);

               // Set the raycaster position
               //this[s_raycaster].set(this[s_camera].position, vector.sub(this[s_camera].position).normalize());

               // Find all intersected objects
               var intersects = this[s_raycaster].intersectObjects(this[s_impostors], true);

               // Filter spherical impostors
               //
               var currentScene = this[s_scene];

               var intersects2 = this[s_raycaster].intersectObjects([this[s_selectionPlane]]);
               //console.log(intersects2[0].point);
               this[s_impostor].z = intersects2[0].point.z;
               this[s_impostor].x = intersects2[0].point.x;
               //this[s_scene].addControlPoint(this[s_impostor].clone());

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
               //console.log(mouseVector);


               // Get 3D vector from 3D mouse position using
               // 'unproject' function
               var vector = new THREE.Vector3(mouseX, mouseY, 1);
               //vector.unproject(this[s_camera]);

               this[s_raycaster].setFromCamera(mouseVector, this[s_camera]);
               //     this[s_camera].position, vector.sub(
               //         this[s_camera].position).normalize());

               if (this[s_selectedObject]) {
                    // Check the position where the plane is intersected
                    var intersects =
                         this[s_raycaster].intersectObject(this[s_selectionPlane]);
                    // Reposition the object based on the intersection point with the plane
                    this[s_selectedObject].position.copy(intersects[0].point.sub(this[s_offset]));
               } else {
                    // Update position of the plane if need
                    var intersects =
                         this[s_raycaster].intersectObjects(this[s_impostors], true);
                    if (intersects.length > 0) {
                         this[s_selectionPlane].position.copy(intersects[0].object.position);
                         this[s_selectionPlane].lookAt(this[s_camera].position);
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

               this[s_dragControls] = new THREE.DragControls(this[s_camera], this[s_scene].controlPointImpostors.children, this[s_renderer].domElement);
               this[s_dragControls].on('hoveron', function(e) {
                    _this[s_transformControls].attach(e.object);
                    cancelHideTransform();
               });
               this[s_dragControls].on('hoveroff', function(e) {
                    if (e) delayHideTransform();
               });
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

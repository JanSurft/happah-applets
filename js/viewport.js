//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', 'dragcontrols', 'trackballcontrols'], function($, THREE, THREE, happah, happah2) {
     var s_camera = Symbol('camera');
     var s_dragControls = Symbol('dragControls');
     var s_renderer = Symbol('renderer');
     var s_scene = Symbol('scene');
     var s_controls = Symbol('trackballControls');
     var s_transformControls = Symbol('transformControls');
     var s_grid = Symbol('grid');
     var s_storyboard = Symbol('storyboard');
     var s_currentFrame = Symbol('currentframe');
     var s_algorithm = Symbol('algorithm');

     // For testing purposes only
     var s_trackball = Symbol('trackball');
     var s_addMode = Symbol('addMode');
     var s_isHead = Symbol('ishead');


     class Viewport {

          constructor(canvas, scene, algorithm) {
               this.update = this.update.bind(this);
               this.onMouseDoubleclick = this.onMouseDoubleclick.bind(this);
               this.onMouseClick = this.onMouseClick.bind(this);
               //this.addControlPoint = this.addControlPoint.bind(this);
               var _this = this;

               this[s_storyboard] = algorithm.storyboard();
               this[s_algorithm] = algorithm;
               this[s_currentFrame] = 0;
               this[s_scene] = scene;
               this[s_scene].segmentStrips = this[s_storyboard].frame[this[s_currentFrame]].segmentStrips;
               this[s_scene].algorithm = algorithm;
               $(this[s_scene]).bind('update.happah', function() {
                    _this.update();
               });

               var context = canvas.getContext('webgl2');
               context.getExtension('EXT_frag_depth');
               var parameters = {
                    canvas: canvas,
                    context: context
               };
               this[s_grid] = new THREE.GridHelper(500, 10);
               this[s_grid].position.y = -0.001;
               this[s_renderer] = new THREE.WebGLRenderer(parameters);
               this[s_renderer].setClearColor(0xFFFFFF); //TODO: can renderer and viewport be separated?
               this[s_renderer].setSize($(canvas).width(), $(canvas).height());
               //this[s_camera] = new THREE.PerspectiveCamera(45, $(canvas).width() / $(canvas).height(), 1, 1000);

               this[s_camera] = new THREE.OrthographicCamera($(canvas).width() / -2, $(canvas).width() / 2, $(canvas).height() / 2, $(canvas).height() / -2, -500, 1000);
               //this[s_camera].position.z = 0;
               //this[s_camera].position.y = 10;
               //this[s_camera].position.x = 0;
               this[s_camera].position.z = 0; // 0 for orthographic camera
               this[s_camera].position.y = 1;
               this[s_camera].position.x = 0; // 0 for orthographic camera
               this[s_camera].lookAt(scene.position);
               this[s_camera].zoom = 2.5;
               this[s_camera].updateProjectionMatrix();

               //this[s_controls] = new THREE.TrackballControls(this[s_camera], this[s_renderer].domElement);
               //this[s_controls].target.set(0, 0, 0);
               //this[s_controls].noZoom = true;

               // TODO:
               //this[s_controls].addEventListener('change', this.update);
               // Test:
               this[s_addMode] = false;
               this[s_controls] = new THREE.TrackballControls(this[s_camera]);

               this[s_dragControls] = new happah.DragControls(this[s_scene], this[s_controls], this[s_camera]);

               // Trackball controls for camera movement
               this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onDocumentMouseMove, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onDocumentMouseDown, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onDocumentMouseUp, false);

               //this[s_renderer].domElement.addEventListener('mousedown', this.addControlPoint, false);
               this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onMouseMove, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onMouseKeyDown, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onMouseKeyUp, false);

               // Drag controls for dragging and dropping objects
               this[s_renderer].domElement.addEventListener('mousemove', this[s_dragControls].mouseMove, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_dragControls].mouseUp, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_dragControls].mouseDown, false);
               this[s_renderer].domElement.addEventListener('DOMMouseScroll', this[s_dragControls].mouseWheel, false);
               this[s_renderer].domElement.addEventListener('mousewheel', this[s_dragControls].mouseWheel, false);

               // For adding controlpoints
               this[s_renderer].domElement.addEventListener('dblclick', this.onMouseDoubleclick, false);
               this[s_renderer].domElement.addEventListener('click', this.onMouseClick, false);
          }

          applyFrame(frame) {
               // Reset all previous modifications
               //this[s_scene].removeControlPoints();

               // Add the points needed for the frame
               //this[s_scene].addControlPoints(frame.points);

               // Set the relevant flags
               this[s_scene].curveState = frame.showCurve;

               this[s_scene].segmentStrips = this[s_storyboard].frame[this[s_currentFrame]].segmentStrips;
               var asd = this[s_scene].segmentStrips;

               this[s_scene].redraw();
          }

          nextFrame() {
               if (this[s_currentFrame] < this[s_storyboard].frame.length - 1)
                    this[s_currentFrame]++;


               this.currentFrame();
          }

          currentFrame() {
               this.applyFrame(this[s_storyboard].frame[this[s_currentFrame]]);
          }

          previousFrame() {
               if (this[s_currentFrame] > 0)
                    this[s_currentFrame]--;

               this.currentFrame();
          }

          clearScene() {
               this[s_scene].removeControlPoints();
               this[s_addMode] = true;

               // Update the cursor
               this[s_renderer].domElement.style.cursor = "crosshair";
               this[s_dragControls].disable();
          }

          set gridState(state) {
               if (state) {
                    this[s_scene].add(this[s_grid]);
               } else {
                    this[s_scene].remove(this[s_grid]);
               }
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
                    this[s_addMode] = true;
                    // Set the cursor
                    this[s_renderer].domElement.style.cursor = "crosshair";
                    this[s_dragControls].disable();
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
                    if (intersects[0]) {
                         this[s_addMode] = false;
                         this[s_renderer].domElement.style.cursor = "default";
                         this[s_dragControls].enable();
                         return;
                    }

                    // Intersect with XZ-plane
                    var position = raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

                    // Add a new point to the specified position
                    this[s_scene].addControlPoints([position], this[s_isHead]);

                    this[s_storyboard] = this[s_algorithm].storyboard();
               }
          }

          update() { //TODO: make update private
               this[s_scene].animate();
               this[s_renderer].render(this[s_scene], this[s_camera]);
          }

          animate() {
               requestAnimationFrame(this.animate.bind(this));
               this.update();
               //               this[s_controls].update();
               //this[s_transformControls].update();
          }

     } //class Viewport

     return {
          Viewport: Viewport
     };
});

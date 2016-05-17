//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', 'dragcontrols', 'trackballcontrols', 'spherical-impostor', 'scrollbar', 'addcontrols'], function($, THREE, THREE, happah, happah2, happah3, happah4, happah5) {
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
     var s_bar = Symbol('bar');
     var s_canvas = Symbol('canvas');
     var s_sequence = Symbol('sequence');
     var s_counter = Symbol('counter');
     var s_addControls = Symbol('addcontrols');
     var s_scrollbar = Symbol('scrollbar');

     class Viewport {

          constructor(canvas, scene, algorithm) {
               this.update = this.update.bind(this);
               this.mouseWheel = this.mouseWheel.bind(this);
               //this.addControlPoint = this.addControlPoint.bind(this);
               var _this = this;

               this[s_canvas] = canvas;
               this[s_storyboard] = algorithm.storyboard();
               this[s_algorithm] = algorithm;
               this[s_currentFrame] = 0;
               this[s_scene] = scene;
               this[s_scene].segmentStrips = this[s_storyboard].frame[this[s_currentFrame]].segmentStrips;
               this[s_scene].algorithm = algorithm;
               $(this[s_scene]).bind('update.happah', function() {
                    _this.update();
               });

               var context = canvas.getContext('webgl');
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
               this[s_addMode] = false;
               this[s_sequence] = false;
               this[s_counter] = 0;

               this[s_camera].position.z = 0; // 0 for orthographic camera
               this[s_camera].position.y = 1;
               this[s_camera].position.x = 0; // 0 for orthographic camera
               this[s_camera].lookAt(scene.position);
               this[s_camera].zoom = 2.5;

               this[s_controls] = new THREE.TrackballControls(this[s_camera]);
               this[s_controls].noZoom = true;

               // TODO:
               this[s_controls].addEventListener('change', this.update);
               // Test:

               //this[s_controls] = new THREE.TrackballControls(this[s_camera]);

               this[s_dragControls] = new happah.DragControls(this[s_scene], this[s_controls], this[s_camera]);
               this[s_scrollbar] = new happah4.Scrollbar(this[s_scene], this[s_controls], this[s_camera], $(canvas));
               this[s_addControls] = new happah5.AddControls(this[s_renderer], this[s_scene], this[s_algorithm], this[s_storyboard], this[s_camera]);

               // Trackball controls for camera movement
               this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onDocumentMouseMove, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onDocumentMouseDown, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onDocumentMouseUp, false);

               this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onMouseMove, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onMouseKeyDown, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onMouseKeyUp, false);

               // Drag controls for dragging and dropping objects
               this[s_renderer].domElement.addEventListener('mousemove', this[s_dragControls].mouseMove, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_dragControls].mouseUp, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_dragControls].mouseDown, false);
               this[s_renderer].domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
               this[s_renderer].domElement.addEventListener('mousewheel', this.mouseWheel, false);

               // Scrollbar controls
               this[s_renderer].domElement.addEventListener('mousedown', this[s_scrollbar].mouseDown, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_scrollbar].mouseUp, false);
               this[s_renderer].domElement.addEventListener('mousemove', this[s_scrollbar].mouseMove, false);

               // For adding controlpoints
               this[s_renderer].domElement.addEventListener('dblclick', this[s_addControls].onMouseDoubleclick, false);
               this[s_renderer].domElement.addEventListener('click', this[s_addControls].onMouseClick, false);
          }

          applyFrame(frame) {
               // Reset all previous modifications
               //this[s_scene].removeControlPoints();

               // Add the points needed for the frame
               //this[s_scene].addControlPoints(frame.points);

               // Set the label text
               $('#hph-label').text("Frame: " + frame.title);

               // Set the relevant flags
               this[s_scene].curveState = frame.showCurve;

               this[s_scene].segmentStrips = this[s_storyboard].frame[this[s_currentFrame]].segmentStrips;
               //var asd = this[s_scene].segmentStrips;

               //this[s_scene].redraw();
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

          set sequence(state) {
               this[s_sequence] = state;
          }

          /** Called whenever the mouse wheel is moved */
          mouseWheel(event) {
               event.preventDefault();

               var delta;

               if (event.wheelDelta) {
                    delta = event.wheelDeltaY / 35;
               } else if (event.detail) {
                    // This works with Firefox
                    delta = -event.detail / 2;
               } else {
                    delta = 0;
               }
               // Zoom speed
               delta = delta * 0.06;

               if (this[s_camera].zoom + delta < 0) {
                    delta = 0;
               }

               // Enlarge the control-bar
               //this[s_scene].remove(this[s_camera]);
               //this[s_camera].remove(this[s_bar]);
               var position = new THREE.Vector3();

               //var geometry = new THREE.CylinderGeometry(2, 2, this[s_bar].height * 10, 32);
               //geometry.rotateZ(Math.PI / 2);
               //this[s_bar] = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial().clone(this[s_bar].material));
               //this[s_bar].position.set(0, -($(this[s_canvas]).height() / 6), -0.3);
               //this[s_camera].add(this[s_bar]);
               //this[s_scene].add(this[s_camera]);
               this[s_camera].zoom += delta;
               this[s_camera].updateProjectionMatrix();
          }

          update() { //TODO: make update private
               this[s_scene].animate();
               this[s_renderer].render(this[s_scene], this[s_camera]);
               this[s_storyboard] = this[s_algorithm].storyboard();
               this.currentFrame();
          }

          animate() {
               requestAnimationFrame(this.animate.bind(this));
               this.update();
               this[s_controls].update();

               // Handle sequence here
               this[s_counter]++;
               if (this[s_sequence] && this[s_counter] % 100 == 0) {
                    this.nextFrame();
               }
               //this[s_transformControls].update();
          }

     } //class Viewport

     return {
          Viewport: Viewport
     };
});

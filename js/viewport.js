//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', 'dragcontrols', 'spherical-impostor', 'scrollbar', 'addcontrols', 'defaults'], function($, THREE, THREE, dragcontrols, sphericalimpostor, SCROLLBAR, ADDCONTROLS, defaults) {
     var s_camera = Symbol('camera');
     var s_dragControls = Symbol('dragControls');
     var s_renderer = Symbol('renderer');
     var s_scene = Symbol('scene');
     var s_controls = Symbol('trackballControls');
     var s_grid = Symbol('grid');
     var s_storyboard = Symbol('storyboard');
     var s_currentFrame = Symbol('currentframe');
     var s_algorithm = Symbol('algorithm');
     var s_sequence = Symbol('sequence');
     var s_counter = Symbol('counter');
     var s_addControls = Symbol('addcontrols');
     var s_scrollbar = Symbol('scrollbar');
     var s_zoom = Symbol('zoom');
     var s_drawCurve = Symbol('drawcurve');
     var s_drawPoly = Symbol('drawpoly');

     // Overlay
     var s_overlay = Symbol('overlay');
     var s_overlayCam = Symbol('overlayCam');

     class Viewport {

          constructor(canvas, scene, algorithm) {
               this.update = this.update.bind(this);
               this.mouseWheel = this.mouseWheel.bind(this);
               var _this = this;

               this[s_storyboard] = algorithm.storyboard();
               this[s_algorithm] = algorithm;
               this[s_currentFrame] = 0;
               this[s_scene] = scene;
               this[s_scene].meshes = this[s_storyboard].frame[0].meshes;

               // TBD..
               $(this[s_scene]).bind('update.happah', function() {
                    _this.update();
               });

               var context = canvas.getContext('webgl');
               context.getExtension('EXT_frag_depth');

               var parameters = {
                    antialias: false,
                    canvas: canvas,
                    context: context
               };
               this[s_renderer] = new THREE.WebGLRenderer(parameters);
               this[s_renderer].setClearColor(0xFFFFFF);
               this[s_renderer].setSize($(canvas).width(), $(canvas).height());

               // For dual-scene-rendering
               this[s_renderer].autoClear = false;

               this[s_grid] = new THREE.GridHelper(500, 20);
               this[s_grid].position.y = -0.001;

               this[s_sequence] = false;
               this[s_counter] = 0;

               this[s_camera] = defaults.Defaults.orthographicCamera($(canvas));
               this[s_overlayCam] = defaults.Defaults.orthographicCamera($(canvas));

               this[s_overlayCam].position.set(0, 1, 0); // 0 for orthographic camera
               this[s_overlayCam].lookAt(scene.position);
               this[s_overlayCam].zoom = 2.2;
               this[s_overlayCam].updateProjectionMatrix();

               this[s_controls] = new THREE.TrackballControls(this[s_camera]);
               this[s_controls].noZoom = true;

               // TODO:
               //this[s_controls].addEventListener('change', this.test);

               // Screen overlay
               this[s_overlay] = new THREE.Scene();

               this[s_dragControls] = new dragcontrols.DragControls(this[s_scene], this[s_controls], this[s_camera]);

               // Lighting
               this[s_overlay].add(defaults.Defaults.basicLights());
               this[s_scene].add(defaults.Defaults.basicLights());

               this[s_scrollbar] = new SCROLLBAR.Scrollbar(this[s_overlay], this[s_controls], this[s_overlayCam], this);
               this[s_scrollbar].value = 0.5;
               this[s_addControls] = new ADDCONTROLS.AddControls(this, this[s_scene], this[s_camera], 0);

               // Trackball controls for camera movement TBD...
               this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onDocumentMouseMove, false);
               this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onDocumentMouseDown, false);
               this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onDocumentMouseUp, false);

               // Drag controls for dragging and dropping objects
               this[s_dragControls].listenTo(this[s_renderer].domElement);
               this[s_renderer].domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
               this[s_renderer].domElement.addEventListener('wheel', this.mouseWheel, false);

               // Scrollbar controls
               this[s_scrollbar].listenTo(this[s_renderer].domElement);

               // For adding controlpoints
               this[s_addControls].listenTo(this[s_renderer].domElement);

               // Update
               this.currentFrame();
          }

          // Call if the storyboard is out of date
          rebuildStoryboard() {
               this[s_storyboard] = this[s_algorithm].storyboard(this[s_scrollbar].value);

               // In any case when the storyboard is rebuilt, the scene has to be
               // updated.
               this[s_scene].redraw();
          }

          get addControls() {
               return this[s_addControls];
          }

          addLight(lights) {
               this[s_scene].add(lights);
               this[s_overlay].add(lights);
          }

          nextFrame() {
               if (this[s_currentFrame] < this[s_storyboard].frame.length - 1) {
                    this[s_currentFrame]++;
               }

               // enable the frame by switching the show flag
               this[s_storyboard].frame[this[s_currentFrame]].show = true;

               this.currentFrame();
          }

          // TODO: move everything to update
          currentFrame() {
               if (this[s_currentFrame] < this[s_storyboard].frame.length - 1)
                    $('#hph-forward').css("color", "#333");
               else
                    $('#hph-forward').css("color", "grey");

               // Adapt the frames to the new conditions
               this.rebuildStoryboard();
          }

          previousFrame() {
               this[s_storyboard].frame[this[s_currentFrame]].show = false;

               if (this[s_currentFrame] > 0)
                    this[s_currentFrame]--;

               this.currentFrame();
          }

          clearScene() {
               this[s_scene].removeControlPoints();
               this[s_addControls].enterAddMode();
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

          set curveState(state) {
               this[s_drawCurve] = state;
               this.currentFrame();
          }

          set polyState(state) {
               this[s_drawPoly] = state;
               this.currentFrame();
          }

          get camera() {
               return this[s_camera];
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
                    delta = -event.deltaY;
               }
               // Zoom speed
               delta = delta * 0.06;

               if (this[s_camera].zoom + delta < 0) {
                    delta = 0;
               }

               this[s_camera].zoom += delta;
               this[s_camera].updateProjectionMatrix();
               this[s_scene].redraw();
          }

          update() {
               requestAnimationFrame(this.update.bind(this));

               if (this[s_scene].altered) {
                    // TODO replace with storyboard.update()
                    this.rebuildStoryboard();

                    // Get a temporary variable
                    var currentFrame = this[s_storyboard].frame[this[s_currentFrame]];

                    //Set the label text
                    $('#hph-label').text("Frame: " + currentFrame.title);

                    /*

                    // TODO: find different way
                    // Collect all meshes and points from previous iterations
                    for (var i = 0; i < this[s_currentFrame]; i++) {
                         var frame = this[s_storyboard].frame[i];

                         // Concat mesh/point arrays
                         meshes = meshes.concat(frame.meshes);
                         points = points.concat(frame.points);
                         //points = this[s_storyboard].frame[i].points;

                         // meshes[0] is the least recently added one.
                         //frame.meshes[0].material.color = new THREE.Color(0xff0000);
                         //frame.meshes[0].material.needsUpdate = true;
                    }
                    */
                    // Add the current frame's mesh
                    var meshes = currentFrame.meshes;
                    var points = currentFrame.points;

                    // If curve is enabled, add curve
                    if (this[s_drawCurve] == true) {
                         // Curve is the last frame
                         meshes = meshes.concat(this[s_storyboard].frame[this[s_storyboard].frame.length - 1]);
                    }
                    // If control-polygon is enabled, add first frame
                    if (this[s_drawPoly]) {
                         meshes = meshes.concat(this[s_storyboard].frame[0].meshes);
                    }

                    var impostors = new Array();

                    // FIXME
                    // Convert points to impostors
                    for (var i in points) {
                         var imp = new sphericalimpostor.SphericalImpostor(3);
                         imp.position.copy(points[i]);
                         imp.material.uniforms.diffuse.value.set(0x404040);
                         impostors.push(imp);
                    }

                    // TODO make this better loookign
                    this[s_scene].points = impostors;
                    this[s_scene].meshes = meshes;
                    //for (var i in meshes)
                    //this[s_scene].add(meshes[i]);
                    this[s_scene].paint();

               }
               // FIXME: does this belong inside the if-block?
               // Render scene + scene overlay
               this[s_renderer].clear();
               this[s_renderer].render(this[s_scene], this[s_camera]);
               this[s_renderer].clearDepth();
               this[s_renderer].render(this[s_overlay], this[s_overlayCam]);

               this[s_controls].update();


               // Handle sequence here
               this[s_counter] = this[s_counter]++ % 101;
               if (this[s_sequence] && this[s_counter] % 100 == 0) {
                    this.nextFrame();
               }
          }

     } //class Viewport

     return {
          Viewport: Viewport
     };
});

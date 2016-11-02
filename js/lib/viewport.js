//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
// @author Stephan Engelmann (stephan-enelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', './dragcontrols',
     './spherical-impostor', './addcontrols', './defaults'
], function($, THREE, THREE, dragcontrols, sphericalimpostor, ADDCONTROLS, defaults) {
     const background_color = 0xFFFFFF;
     const helper_points_color = 0x404040;
     const helper_points_radius = 3;

     var s_addControls = Symbol('addcontrols');
     var s_algorithm = Symbol('algorithm');
     var s_camera = Symbol('camera');
     var s_trackballControls = Symbol('trackballControls');
     var s_counter = Symbol('counter');
     var s_currentFrame = Symbol('currentframe');
     var s_dragControls = Symbol('dragControls');
     var s_drawCurve = Symbol('drawcurve');
     var s_drawPoly = Symbol('drawpoly');
     var s_grid = Symbol('grid');
     var s_overlay = Symbol('overlay');
     var s_cameraOverlay = Symbol('overlayCam');
     var s_renderer = Symbol('renderer');
     var s_scene = Symbol('scene');
     var s_scrollbar = Symbol('scrollbar');
     var s_sequence = Symbol('sequence');
     var s_storyboard = Symbol('storyboard');
     var s_zoom = Symbol('zoom');

     class Viewport {

          constructor(canvas, scene, algorithm) {
               var _this = this;
               var context = canvas.getContext('webgl');
               context.getExtension('EXT_frag_depth');

               this.mouseWheel = this.mouseWheel.bind(this);
               this.update = this.update.bind(this);

               this[s_algorithm] = algorithm;
               this[s_camera] = defaults.Defaults.orthographicCamera($(canvas));
               this[s_cameraOverlay] = this[s_camera].clone()
               this[s_cameraOverlay].position.set(0, 1, 0); // 0 for orthographic camera
               this[s_cameraOverlay].lookAt(scene.position);
               this[s_cameraOverlay].zoom = 2.2;
               this[s_cameraOverlay].updateProjectionMatrix();
               this[s_counter] = 0;
               this[s_currentFrame] = 0;
               this[s_drawPoly] = true;
               this[s_grid] = new THREE.GridHelper(500, 20);
               this[s_grid].position.y = -0.001;
               this[s_overlay] = new THREE.Scene();
               this[s_overlay].add(defaults.Defaults.basicLights());
               this[s_renderer] = new THREE.WebGLRenderer({
                    antialias: true,
                    canvas: canvas,
                    context: context
               });
               this[s_renderer].autoClear = false; // For dual-scene-rendering
               this[s_renderer].setClearColor(background_color);
               this[s_renderer].setSize($(canvas).width(), $(canvas).height());
               this[s_sequence] = false;
               this[s_storyboard] = algorithm.storyboard();

               this[s_scene] = scene;
               this[s_scene].add(defaults.Defaults.basicLights());
               this[s_scene].meshes = this[s_storyboard].frame(0).meshes;
               // TBD..
               $(this[s_scene]).bind('update.happah', function() {
                    _this.update();
               });

               this[s_trackballControls] = new THREE.TrackballControls(this[s_camera], this[s_renderer].domElement);
               this[s_trackballControls].noZoom = true;

               // for adding control points
               this[s_addControls] = new ADDCONTROLS.AddControls(this, this[s_scene], this[s_camera], 0);
               this[s_addControls].listenTo(this[s_renderer].domElement);

               // to move objects
               this[s_dragControls] = new dragcontrols.DragControls(this[s_scene], this[s_trackballControls], this[s_camera]);
               this[s_dragControls].listenTo(this[s_renderer].domElement);

               // add event listeners for user interactions
               this[s_renderer].domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
               this[s_renderer].domElement.addEventListener('wheel', this.mouseWheel, false);
               this.update();
          }

          // Call if the storyboard is out of date
          rebuildStoryboard() {
               this[s_storyboard] = this[s_storyboard].rebuild();
               this[s_scene].redraw();
          }

          get addControls() {
               return this[s_addControls];
          }

          get overlay() {
               return this[s_overlay];
          }

          get renderer() {
               return this[s_renderer];
          }

          get controls() {
               return this[s_trackballControls];
          }

          get overlayCam() {
               return this[s_cameraOverlay];
          }

          addLight(lights) {
               this[s_scene].add(lights);
               this[s_overlay].add(lights);
          }

          nextFrame() {
               //if (this[s_currentFrame] < this[s_storyboard].size() - 1) {
               //    this[s_currentFrame]++;
               //}
               this[s_storyboard].nextFrame();
               this[s_scene].redraw();
          }

          // TODO: move everything to update
          currentFrame() {
               if (this[s_currentFrame] < this[s_storyboard].size() - 1)
                    $('#hph-forward').css("color", "#333");
               else
                    $('#hph-forward').css("color", "grey");
               // Adapt the frames to the new conditions
               this.rebuildStoryboard();
          }

          previousFrame() {
               //if (this[s_currentFrame] > 0)
               //    this[s_currentFrame]--;
               this[s_storyboard].previousFrame();
               this[s_scene].redraw();
          }

          clearScene() {
               this[s_scene].removeControlPoints();
               this[s_addControls].enterAddMode();
               this[s_currentFrame] = 0;
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

          // the mouse wheel controls the camera zoom
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
                    //var currentFrame = this[s_storyboard].frame(this[s_currentFrame]);
                    var currentFrame = this[s_storyboard].currentFrame();
                    // Set the label text in the bottom left corner
                    $('#hph-label').text("Frame: " + currentFrame.title);
                    // copy old scene objects
                    var meshes = currentFrame.meshes;
                    var points = currentFrame.points;
                    // control-polygon is the first rendered frame
                    //if (this[s_drawPoly] && this[s_currentFrame] != 0) {
                    //     meshes = meshes.concat(this[s_storyboard].frame[0].meshes);
                    //}
                    if (this[s_drawPoly] && this[s_currentFrame] == this[s_storyboard].size() - 1) {
                         meshes = meshes.concat(this[s_storyboard].firstFrame().meshes);
                    }
                    // If curve is enabled, add curve
                    if (this[s_drawCurve]) {
                         // Curve is the last frame
                         meshes = meshes.concat(this[s_storyboard].lastFrame().meshes);
                    }
                    // generate impostors for helper points
                    var impostors = new Array();
                    var impostor_template = new sphericalimpostor.SphericalImpostor(helper_points_radius);
                    for (var i in points) {
                         var imp = impostor_template.clone();
                         imp.position.copy(points[i]);
                         imp.material.uniforms.diffuse.value.set(helper_points_color);
                         impostors.push(imp);
                    }
                    this[s_scene].points = impostors;
                    this[s_scene].meshes = meshes;
                    this[s_scene].paint();
               }
               // FIXME: does this belong inside the if-block?
               // Render scene + scene overlay
               this[s_renderer].clear();
               this[s_renderer].render(this[s_scene], this[s_camera]);
               this[s_renderer].clearDepth();
               this[s_renderer].render(this[s_overlay], this[s_cameraOverlay]);

               this[s_trackballControls].update();

               // FIXME: use time for animation speed
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

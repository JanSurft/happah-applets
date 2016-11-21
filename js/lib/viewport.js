//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
// @author Stephan Engelmann (stephan-enelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', './dragcontrols',
     './spherical-impostor', './defaults', './labelmanager'
], function($, THREE, THREE, dragcontrols, sphericalimpostor, defaults, LABEL) {
     const background_color = 0xFFFFFF;
     const helper_points_color = 0x404040;
     const helper_points_radius = 3;

     var s_algorithm = Symbol('algorithm');
     var s_camera = Symbol('camera');
     var s_trackballControls = Symbol('trackballControls');
     var s_counter = Symbol('counter');
     var s_currentFrame = Symbol('currentframe');
     var s_dragControls = Symbol('dragControls');
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
     var s_labelmanager = Symbol('labelmanager');

     class Viewport {

          constructor(canvas, scene, algorithm, params = {
               enableDragcontrols: true,
          }) {
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
               this[s_labelmanager] = new LABEL.LabelManager(this[s_camera], this[s_cameraOverlay]);

               this[s_scene] = scene;
               this[s_scene].add(defaults.Defaults.basicLights());
               this[s_scene].lines = this[s_storyboard].frame(0).lines;
               // TBD..
               $(this[s_scene]).bind('update.happah', function() {
                    _this.update();
               });

               this[s_trackballControls] = new THREE.TrackballControls(this[s_camera], this[s_renderer].domElement);
               this[s_trackballControls].noZoom = true;

               if (params['enableDragcontrols']) {
                    // to move objects
                    this[s_dragControls] = new dragcontrols.DragControls(this[s_scene], this[s_trackballControls], this[s_camera]);
                    this[s_dragControls].listenTo(this[s_renderer].domElement);
               }

               // add event listeners for user interactions
               this[s_renderer].domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
               this[s_renderer].domElement.addEventListener('wheel', this.mouseWheel, false);
               this.update();
          }

          // Call if the storyboard is out of date
          rebuildStoryboard() {
               var storyboard_index = this[s_storyboard].index;
               this[s_storyboard] = this[s_algorithm].storyboard();
               this[s_storyboard].index = storyboard_index;
               this[s_scene].redraw();
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
               this[s_storyboard].nextFrame();
               this[s_scene].redraw();
          }

          previousFrame() {
               this[s_storyboard].previousFrame();
               this[s_scene].redraw();
          }

          clearScene() {
               this[s_scene].removeControlPoints();

               // Fire event
               var event = new CustomEvent('clrscene', {
                    "detail": "Controlpoints removed"
               });
               this[s_renderer].domElement.dispatchEvent(event);
          }

          get labelManager() {
               return this[s_labelmanager];
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

               // Label positions need to be adjusted
               this[s_labelmanager].updatePositions();
          }

          update() {
               requestAnimationFrame(this.update.bind(this));
               if (this[s_scene].altered) {
                    // TODO replace with storyboard.update()
                    this.rebuildStoryboard();
                    var currentFrame = this[s_storyboard].currentFrame();
                    // Set the label text in the bottom left corner
                    $('#hph-label').text("Frame: " + currentFrame.title);
                    // copy old scene objects
                    var lines = currentFrame.lines;
                    var points = currentFrame.points;
                    // control-polygon is the first rendered frame
                    //if (this[s_drawPoly] && this[s_currentFrame] != 0) {
                    //     lines = lines.concat(this[s_storyboard].frame[0].lines);
                    //}
                    //if (this[s_drawPoly] && this[s_currentFrame] == this[s_storyboard].size() - 1) {
                    //lines = lines.concat(this[s_storyboard].firstFrame().lines);
                    //}
                    // If curve is enabled, add curve
                    // generate impostors for helper points
                    var impostors = new THREE.Object3D();
                    var impostor_template = new sphericalimpostor.SphericalImpostor(helper_points_radius);

                    for (var i in points) {
                         var imp = impostor_template.clone();
                         imp.position.copy(points[i]);
                         imp.material.uniforms.diffuse.value.set(helper_points_color);
                         impostors.add(imp);
                    }
                    // Remove old labels before adding new ones
                    this[s_labelmanager].removeLabels("points");
                    for (var i in currentFrame.labels) {
                         this[s_labelmanager].addLabel(currentFrame.labels[i], points[i], "points");
                    }

                    this[s_scene].points = impostors;
                    this[s_scene].lines = lines;
                    this[s_scene].paint();
               }
               // FIXME: does this belong inside the if-block?
               // Render scene + scene overlay
               //this[s_renderer].clear();
               //this[s_renderer].clearDepth();
               this[s_renderer].render(this[s_scene], this[s_camera]);
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

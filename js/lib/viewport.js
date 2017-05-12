//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
// @author Stephan Engelmann (stephan-enelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['./decasteljaualgorithm', 'jquery', 'three', 'three-trackballcontrols',
     './defaults', './labelmanager'
], function(ALGORITHM, $, THREE, CONTROLS, defaults, LABEL) {
     const background_color = 0xFFFFFF;
     const helper_points_color = 0x404040;
     const helper_points_radius = 3;

     var s_algorithm = Symbol('algorithm');
     var s_camera = Symbol('camera');
     var s_trackballControls = Symbol('trackballControls');
     var s_counter = Symbol('counter');
     var s_currentFrame = Symbol('currentframe');
     //var s_dragControls = Symbol('dragControls');
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
     var s_lines = Symbol('lines');
     var s_points = Symbol('points');
     var s_storyboardNeedsUpdate = Symbol('storyboardneedsupdate');
     var s_sceneNeedsUpdate = Symbol('sceneneedsupdate');
     var s_canvas = Symbol('canvas');

     class Viewport {

          constructor(canvas, scene, algorithm) {
               var context = canvas.getContext('webgl');
               this[s_canvas] = canvas;
               context.getExtension('EXT_frag_depth');

               this.mouseWheel = this.mouseWheel.bind(this);
               this.update = this.update.bind(this);

               this[s_points] = new THREE.Object3D();
               this[s_lines] = [new THREE.Object3D()];
               if (algorithm != null) {
                    this[s_algorithm] = algorithm;
               } else {
                    this[s_algorithm] = new ALGORITHM.DeCasteljauAlgorithm([]);
               }
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
               this[s_storyboardNeedsUpdate] = false;
               this[s_labelmanager] = new LABEL.LabelManager(this[s_camera], this[s_cameraOverlay]);

               this[s_scene] = scene;
               this[s_scene].add(defaults.Defaults.basicLights());
               //this[s_scene].lines = this[s_storyboard].frame(0).lines;
               // TBD..
               var _this = this;
               $(this[s_scene]).bind('update.happah', function() {
                    _this.update();
               });

               this[s_trackballControls] = new TrackballControls(this[s_camera], this[s_renderer].domElement);
               this[s_trackballControls].noZoom = true;
               //this[s_trackballControls] = new CONTROLS.TrackballControls(this[s_camera], this[s_scene]);

               /**
                * Change event can be fired anywhere via jQuery.
                * Still TODO: hack trackballcontrols to fire events!
                *             + change name to update
                */
               this.updateListener = this.updateListener.bind(this);
               $(document).on("change", this.updateListener);

               // TODO: too unspecific
               this.rebuildStoryboard = this.rebuildStoryboard.bind(this);
               this.enableControls = this.enableControls.bind(this);
               this.disableControls = this.disableControls.bind(this);
               $(document).on("rebuildStoryboard", this.rebuildStoryboard);
               $(document).on("draggingStarted", this.disableControls);
               $(document).on("draggingStopped", this.enableControls);
               $(document).on("dragging", this.rebuildStoryboard);

               //this.clearScene = this.clearScene.bind(this);
               //$(document).on("clear-all", this.clearScene);

               this.nextFrame = this.nextFrame.bind(this);
               $(document).on("hph-forward", this.nextFrame);

               this.previousFrame = this.previousFrame.bind(this);
               $(document).on("hph-backward", this.previousFrame);

               // add event listeners for user interactions
               this[s_renderer].domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
               this[s_renderer].domElement.addEventListener('wheel', this.mouseWheel, false);


               // This is only for trackballcontrols
               this.update();
               $.event.trigger({
                    type: "rebuildStoryboard"
               });
          }
          disableControls(event) {
               this[s_trackballControls].enabled = false;
          }
          enableControls(event) {
               this[s_trackballControls].enabled = true;
          }

          // Call if the storyboard is out of date
          rebuildStoryboard(event) {
               this[s_storyboardNeedsUpdate] = true;
          }

          get canvas() {
               return this[s_canvas];
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

          //applyStoryboard(storyboard) {
          //this[s_storyboard] = storyboard;
          //this[s_storyboardNeedsUpdate] = true;
          //}

          addLight(lights) {
               this[s_scene].add(lights);
               this[s_overlay].add(lights);
          }

          nextFrame() {
               this[s_storyboard].nextFrame();
               $.event.trigger({
                    type: "change",
                    message: "switched to next frame!"
               });
          }

          previousFrame() {
               this[s_storyboard].previousFrame();
               $.event.trigger({
                    type: "change",
                    message: "switched to previous frame!"
               });
          }

          get labelManager() {
               return this[s_labelmanager];
          }

          set algorithm(algorithm) {
               this[s_algorithm] = algorithm;
               this[s_storyboard] = algorithm.storyboard();
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
               //this[s_labelmanager].updatePositions();
               //FIXME: this causes a lot of work since the storyboard is
               //rebuilt...
               $.event.trigger({
                    type: "dragging",
                    message: "actually zooming"
               });
          }

          /**
           * Called when ever the
           */
          updateListener(event) {
               this[s_sceneNeedsUpdate] = true;
          }

          /**
           * Animation frame
           */
          update() {
               requestAnimationFrame(this.update.bind(this));

               // Rebuild the storyboard if necessary
               if (this[s_storyboardNeedsUpdate] && this[s_storyboard] != null) {
                    var storyboard_index = this[s_storyboard].index;
                    this[s_storyboard] = this[s_algorithm].storyboard();
                    this[s_storyboard].index = storyboard_index;
                    this[s_storyboardNeedsUpdate] = false;
                    this[s_sceneNeedsUpdate] = true;
               }

               // Paint the scene if necessary
               if (this[s_sceneNeedsUpdate]) {
                    var currentFrame = this[s_storyboard].currentFrame();
                    $('#hph-label').text("Frame: " + currentFrame.title);
                    var lines = currentFrame.lines;
                    var points = currentFrame.points;

                    // Remove old labels before adding new ones
                    this[s_labelmanager].removeLabels("points");

                    // Also update remaining labels
                    //this[s_labelmanager].updatePositions();

                    // Create new labels for intermediate points
                    for (var i in currentFrame.labels) {
                         this[s_labelmanager].addLabel(i, points.children[i].position, "points", false);
                    }

                    // THIS PART WAS MOVED HERE FROM SCENE
                    this[s_scene].remove(this[s_points]);
                    this[s_points] = points;
                    this[s_scene].add(points);

                    // THIS PART WAS MOVED HERE FROM SCENE
                    this[s_scene].remove(this[s_lines])
                    this[s_lines] = new THREE.Object3D()
                    for (var i in lines) {
                         this[s_lines].add(lines[i])
                    }
                    this[s_scene].add(this[s_lines])

                    //this[s_scene].paint();
                    this[s_sceneNeedsUpdate] = false;
               }

               // Render scene + scene overlay
               this[s_renderer].render(this[s_scene], this[s_camera]);
               this[s_renderer].render(this[s_overlay], this[s_cameraOverlay]);

               // TODO: trackballControls should fire an event when
               // it has changed the scene
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

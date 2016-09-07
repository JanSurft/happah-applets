//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
// TODO: make it less of a 'god' class
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', 'dragcontrols', 'spherical-impostor', 'scrollbar', 'addcontrols', 'defaults'], function($, THREE, THREE, dragcontrols, sphericalimpostor, scrollbar, addcontrols, defaults) {
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
                canvas: canvas,
                context: context
            };
            this[s_renderer] = new THREE.WebGLRenderer(parameters);
            this[s_renderer].setClearColor(0xFFFFFF);
            this[s_renderer].setSize($(canvas).width(), $(canvas).height());

            // For dual-scene-rendering
            this[s_renderer].autoClear = false;

            this[s_grid] = new THREE.GridHelper(500, 10);
            this[s_grid].position.y = -0.001;

            this[s_sequence] = false;
            this[s_counter] = 0;

            this[s_camera] = defaults.Defaults.orthographicCamera();
            this[s_overlayCam] = defaults.Defaults.orthographicCamera();

            this[s_overlayCam].position.set(0, 1, 0); // 0 for orthographic camera
            this[s_overlayCam].lookAt(scene.position);
            this[s_overlayCam].zoom = 2.2;
            this[s_overlayCam].updateProjectionMatrix();

            this[s_controls] = new THREE.TrackballControls(this[s_camera]);
            this[s_controls].noZoom = true;

            // TODO:
            //this[s_controls].addEventListener('change', this.test);

            this[s_dragControls] = new dragcontrols.DragControls(this[s_scene], this[s_controls], this[s_camera]);

            // Screen overlay
            this[s_overlay] = new THREE.Scene();

            // Lighting
            this[s_overlay].add(defaults.Defaults.basicLights);
            this[s_scene].add(defaults.Defaults.basicLights);

            this[s_scrollbar] = new scrollbar.Scrollbar(this[s_overlay], this[s_controls], this[s_overlayCam], $(canvas), this);
            this[s_scrollbar].value = 0.5;
            this[s_addControls] = new addcontrols.AddControls(this, this[s_scene], this[s_camera]);

            // Trackball controls for camera movement TBD...
            this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onDocumentMouseMove, false);
            this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onDocumentMouseDown, false);
            this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onDocumentMouseUp, false);

            // Drag controls for dragging and dropping objects
            this[s_dragControls].listenTo(this[s_renderer].domElement);
            this[s_renderer].domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
            this[s_renderer].domElement.addEventListener('mousewheel', this.mouseWheel, false);

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

        currentFrame() {
            if (this[s_currentFrame] < this[s_storyboard].frame.length - 1)
                $('#hph-forward').css("color", "#333");
            else
                $('#hph-forward').css("color", "grey");

            // Get a temporary variable
            var currentFrame = this[s_storyboard].frame[this[s_currentFrame]];

            //Set the label text
            $('#hph-label').text("Frame: " + currentFrame.title);

            this.rebuildStoryboard();

            var points = new Array();
            var meshes = new Array();
            for (var i = 0; i < this[s_currentFrame]; i++) {
                var frame = this[s_storyboard].frame[i];
                meshes.push(frame.meshes[0]);
                //meshes.push(this[s_storyboard].frame[i].meshes[0]);
                for (var k in frame.meshes) {
                    meshes.push(frame.meshes[k]);
                }

                points = points.concat(this[s_storyboard].frame[i].points);

                // Paint previous meshes in grey
                frame.meshes[0].material.color = new THREE.Color(0xff0000);
                frame.meshes[0].material.needsUpdate = true;
                //this[s_storyboard].frame[i].mesh.material.color = new THREE.Color(0x3d3d3d);
                //this[s_storyboard].frame[i].mesh.material.needsUpdate = true;
            }
            meshes.push(currentFrame.meshes[0]);

            // Limes curve
            var limesCurve = this[s_storyboard].frame[this[s_storyboard].frame.length - 1];

            if (limesCurve.show == true) {
                console.log("asdfljks");
                meshes.push(limesCurve.meshes[0]);
            }
            points = points.concat(currentFrame.points);
            this[s_scene].meshes = meshes;
            // TODO use set meshes
            var impostors = [];


            if (points[0] != null) {
                for (var i in points) {
                    var imp = new sphericalimpostor.SphericalImpostor(3);
                    imp.position.copy(points[i]);
                    imp.material.uniforms.diffuse.value.set(0x404040);
                    impostors.push(imp);
                }
            }
            this[s_scene].points = impostors;
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

            // Update the cursor
            this[s_renderer].domElement.style.cursor = "crosshair";
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
            this[s_storyboard].frame[this[s_storyboard].frame.length - 1].show = state;
            console.log(this[s_storyboard].frame[this[s_storyboard].frame.length - 1]);
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
                delta = 0;
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
                this.currentFrame();
                // Get things to draw

                // Set the relevant flags

                this[s_scene].paint();
            }

            this[s_renderer].clear();
            this[s_renderer].render(this[s_scene], this[s_camera]);
            this[s_renderer].clearDepth();
            this[s_renderer].render(this[s_overlay], this[s_overlayCam]);

            this[s_controls].update();

            // Handle sequence here
            this[s_counter]++;
            if (this[s_sequence] && this[s_counter] % 100 == 0) {
                this.nextFrame();
            }
        }

    } //class Viewport

    return {
        Viewport: Viewport
    };
});

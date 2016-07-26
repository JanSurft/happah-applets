//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
// TODO: make it less of a 'god' class
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'TrackballControls', 'dragcontrols', 'trackballcontrols', 'spherical-impostor', 'scrollbar', 'addcontrols'], function($, THREE, THREE, dragcontrols, trackballcontrols, sphericalimpostor, scrollbar, addcontrols) {
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
    var s_altered = Symbol('altered');
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
            this[s_scene].algorithm = algorithm;


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

            this[s_camera] = new THREE.OrthographicCamera($(canvas).width() / -2, $(canvas).width() / 2, $(canvas).height() / 2, $(canvas).height() / -2, -500, 1000);
            this[s_camera].position.z = 0; // 0 for orthographic camera
            this[s_camera].position.y = 1;
            this[s_camera].position.x = 0; // 0 for orthographic camera
            this[s_camera].lookAt(scene.position);
            this[s_camera].zoom = 2.5;
            this[s_camera].updateProjectionMatrix();

            //this[s_overlayCam] = new THREE.PerspectiveCamera(45, $(canvas).width() / $(canvas).height(), 1, 1000);
            this[s_overlayCam] = new THREE.OrthographicCamera($(canvas).width() / -2, $(canvas).width() / 2, $(canvas).height() / 2, $(canvas).height() / -2, -500, 1000);
            this[s_overlayCam].position.z = 0; // 0 for orthographic camera
            this[s_overlayCam].position.y = 1;
            this[s_overlayCam].position.x = 0; // 0 for orthographic camera
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
            var lights = new THREE.Object3D();

            var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x00ee00, 1);
            lights.add(hemisphereLight);
            var dirLight = new THREE.DirectionalLight(0xffffff);
            dirLight.position.set(200, 200, 1000).normalize();
            lights.add(dirLight);

            this[s_overlay].add(lights);

            this[s_scrollbar] = new scrollbar.Scrollbar(this[s_overlay], this[s_controls], this[s_overlayCam], $(canvas), this);
            this[s_scrollbar].value = 0.5;
            this[s_addControls] = new addcontrols.AddControls(this, this[s_scene], this[s_camera]);

            // Initialize some points
            this[s_addControls].addControlPoints([
                new THREE.Vector3(-50, 0, -30), new THREE.Vector3(-40, 0, 30),
                new THREE.Vector3(40, 0, 30), new THREE.Vector3(50, 0, -30),
            ]);

            // Trackball controls for camera movement TBD...
            this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onDocumentMouseMove, false);
            this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onDocumentMouseDown, false);
            this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onDocumentMouseUp, false);

            //this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onMouseMove, false);
            //this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onMouseKeyDown, false);
            //this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onMouseKeyUp, false);

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

        applyFrame(frame) {
            // Set the label text
            $('#hph-label').text("Frame: " + frame.title);

            // Set the relevant flags
            this[s_scene].curveState = frame.showCurve;

            this.rebuildStoryboard();

            this[s_scene].meshes = this[s_storyboard].frame[this[s_currentFrame]].meshes;
            // TODO use set meshes
            var points = this[s_storyboard].frame[this[s_currentFrame]].points;
            var impostors = [];
            /*
                for (var i = 0; i < points.length; i++) {
                    for (var k = 0; k < points[i].length; k++) {
                        var imp = new sphericalimpostor.SphericalImpostor(2);
                        imp.material.uniforms.diffuse.value.set(0x00dd33);
                        imp.position.copy(points[i][k]);
                        impostors.push(imp);
                    }
                }
                */
            if (points[0] != null) {
                for (var i in points[this[s_currentFrame]]) {
                    var imp = new sphericalimpostor.SphericalImpostor(3);
                    imp.position.copy(points[this[s_currentFrame]][i]);
                    imp.material.uniforms.diffuse.value.set(0x404040);
                    impostors.push(imp);
                }
            }
            this[s_scene].points = impostors;
        }

        nextFrame() {
            if (this[s_currentFrame] < this[s_storyboard].frame.length - 1) {
                this[s_currentFrame]++;
            }

            this.currentFrame();
        }

        currentFrame() {
            if (this[s_currentFrame] < this[s_storyboard].frame.length - 1)
                $('#hph-forward').css("color", "#333");
            else
                $('#hph-forward').css("color", "grey");

            this.applyFrame(this[s_storyboard].frame[this[s_currentFrame]]);
        }

        previousFrame() {
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

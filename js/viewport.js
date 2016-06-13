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
            var _this = this;

            this[s_canvas] = canvas;
            this[s_storyboard] = algorithm.storyboard();
            this[s_algorithm] = algorithm;
            this[s_currentFrame] = 0;
            this[s_scene] = scene;
            this[s_scene].meshes = this[s_storyboard].frame[0].meshes;
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
            this[s_renderer] = new
            THREE.WebGLRenderer(parameters);
            this[s_renderer].setClearColor(0xFFFFFF);
            //TODO: can renderer and viewport be separated ?
            this[s_renderer].setSize($(canvas).width(),
                $(canvas).height());
            //this[s_camera] = new THREE.PerspectiveCamera(45,
            //$(canvas).width() / $(canvas).height(), 1, 1000);

            this[s_camera] = new THREE.OrthographicCamera($(canvas).width() /
                -2, $(canvas).width() / 2, $(canvas).height() / 2,
                $(canvas).height() / -2, -500, 1000);
            this[s_addMode] =
                false;
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

            this[s_dragControls] = new dragcontrols.DragControls(this[s_scene], this[s_controls], this[s_camera]);
            this[s_scrollbar] = new scrollbar.Scrollbar(this[s_scene], this[s_controls], this[s_camera], $(canvas));
            this[s_scrollbar].value = 0.5;
            this[s_addControls] = new addcontrols.AddControls(this, this[s_scene], this[s_camera]);
            this[s_addControls].addControlPoints([
                new THREE.Vector3(-50, 0, -30), new THREE.Vector3(-40, 0, 30),
                new THREE.Vector3(40, 0, 30), new THREE.Vector3(50, 0, -30),
            ]);

            // Trackball controls for camera movement TBD...
            this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onDocumentMouseMove, false);
            this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onDocumentMouseDown, false);
            this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onDocumentMouseUp, false);

            this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onMouseMove, false);
            this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onMouseKeyDown, false);
            this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onMouseKeyUp, false);

            // Drag controls for dragging and dropping objects
            this[s_dragControls].listenTo(this[s_renderer].domElement);
            this[s_renderer].domElement.addEventListener('DOMMouseScroll', this.mouseWheel, false);
            this[s_renderer].domElement.addEventListener('mousewheel', this.mouseWheel, false);

            // Scrollbar controls
            this[s_scrollbar].listenTo(this[s_renderer].domElement);

            // For adding controlpoints
            this[s_addControls].listenTo(this[s_renderer].domElement);
        }

        // Call if the storyboard is out of date
        rebuildStoryboard() {
            this[s_storyboard] = this[s_algorithm].storyboard(this[s_scrollbar].value);

            // In any case when the storyboard is rebuilt, the scene has to be
            // updated.
            this[s_scene].redraw();
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

            this.rebuildStoryboard();

            this[s_scene].meshes = this[s_storyboard].frame[this[s_currentFrame]].meshes;
            // TODO use set meshes
            var points = this[s_storyboard].frame[this[s_currentFrame]].points;
            var impostors = [];
            for (var i = 0; i < points.length; i++) {
                for (var k = 0; k < points[i].length; k++) {
                    var imp = new sphericalimpostor.SphericalImpostor(2);
                    imp.material.uniforms.diffuse.value.set(0x00dd33);
                    imp.position.copy(points[i][k]);
                    impostors.push(imp);
                }
            }
            this[s_scene].points = impostors;
            this[s_scene].redraw();
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
        }

    } //class Viewport

    return {
        Viewport: Viewport
    };
});

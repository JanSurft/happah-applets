//////////////////////////////////////////////////////////////////////////////
//
// Viewport
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'trackballcontrols', 'dragcontrols'], function($, THREE, happah, happah2) {
    var s_camera = Symbol('camera');
    var s_dragControls = Symbol('dragControls');
    var s_renderer = Symbol('renderer');
    var s_scene = Symbol('scene');
    var s_controls = Symbol('trackballControls');
    var s_transformControls = Symbol('transformControls');

    // For testing purposes only
    var s_trackball = Symbol('trackball');


    class Viewport {

        constructor(canvas, scene) {
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
            this[s_camera] = new THREE.PerspectiveCamera(75, $(canvas).width() / $(canvas).height(), 0.1, 1000);

            //this[s_camera] = new THREE.OrthographicCamera($(canvas).width() / -2, $(canvas).width() / 2, $(canvas).height() / 2, $(canvas).height() / -2, -500, 1000);
            //this[s_camera].position.z = 0;
            //this[s_camera].position.y = 10;
            //this[s_camera].position.x = 0;
            this[s_camera].position.z = 2;
            this[s_camera].position.y = 10;
            this[s_camera].position.x = 3;
            this[s_camera].lookAt(scene.position);
            this[s_camera].zoom = 2.5;
            this[s_camera].updateProjectionMatrix();

            //this[s_controls] = new THREE.TrackballControls(this[s_camera], this[s_renderer].domElement);
            //this[s_controls].target.set(0, 0, 0);
            //this[s_controls].noZoom = true;
            // Test:
            this[s_controls] = new happah.TrackballControls(this[s_camera], this[s_scene]);

            this[s_dragControls] = new happah2.DragControls(this[s_scene], this[s_controls], this[s_camera]);

            // Trackball controls for camera movement
            //this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onDocumentMouseMove, false);
            //this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onDocumentMouseDown, false);
            //this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onDocumentMouseUp, false);


            this[s_renderer].domElement.addEventListener('mousemove', this[s_controls].onMouseMove, false);
            this[s_renderer].domElement.addEventListener('mousedown', this[s_controls].onMouseKeyDown, false);
            this[s_renderer].domElement.addEventListener('mouseup', this[s_controls].onMouseKeyUp, false);

            // Drag controls for dragging and dropping objects
            this[s_renderer].domElement.addEventListener('mousemove', this[s_dragControls].mouseMove, false);
            this[s_renderer].domElement.addEventListener('mouseup', this[s_dragControls].mouseUp, false);
            this[s_renderer].domElement.addEventListener('mousedown', this[s_dragControls].mouseDown, false);
            this[s_renderer].domElement.addEventListener('DOMMouseScroll', this[s_dragControls].mouseWheel, false);
            this[s_renderer].domElement.addEventListener('mousewheel', this[s_dragControls].mouseWheel, false);

            //this[s_transformControls] = new THREE.TransformControls(this[s_camera], this[s_renderer].domElement);
            //this[s_scene].add(this[s_transformControls]);
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
                //this[s_controls].addEventListener('start', cancelHideTransform);
                //this[s_controls].addEventListener('end', delayHideTransform);
        }

        animate() {
            requestAnimationFrame(this.animate.bind(this));
            this[s_scene].animate();
            this[s_renderer].render(this[s_scene], this[s_camera]);
            //this.update()
            //this[s_controls].update();
            //this[s_transformControls].update();
        }

    } //class Viewport

    return {
        Viewport: Viewport
    };
});

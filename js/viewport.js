define([ 'jquery', 'three', 'TrackballControls', 'TransformControls', 'DragControls' ], function($, THREE) {
     var s_camera = Symbol('camera');
     var s_dragControls = Symbol('dragControls');
     var s_renderer = Symbol('renderer');
     var s_scene = Symbol('scene');
     var s_trackballControls = Symbol('trackballControls');
     var s_transformControls = Symbol('transformControls');

     class Viewport {

     constructor(scene) {
          var _this = this;

          this[s_scene] = scene;
          $(this[s_scene]).bind('update.happah', function() { _this.update(); });

          this[s_camera] = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          this[s_camera].position.z = 20;

          this[s_trackballControls] = new THREE.TrackballControls(this[s_camera]);
          this[s_trackballControls].target.set(0, 0, 0);

          var canvas = $('#happah')[0];
          var context = canvas.getContext('webgl2');
          context.getExtension('EXT_frag_depth');
          var parameters = { canvas: canvas, context: context };
          this[s_renderer] = new THREE.WebGLRenderer(parameters);
          this[s_renderer].setClearColor(0xFFFFFF);
          this[s_renderer].setSize(window.innerWidth, window.innerHeight);
          this[s_renderer].domElement.addEventListener('mousemove', this[s_trackballControls].onDocumentMouseMove, false);
          this[s_renderer].domElement.addEventListener('mousedown', this[s_trackballControls].onDocumentMouseDown, false);
          this[s_renderer].domElement.addEventListener('mouseup', this[s_trackballControls].onDocumentMouseUp, false);

          this[s_transformControls] = new THREE.TransformControls(this[s_camera], this[s_renderer].domElement);
          this[s_scene].add(this[s_transformControls]);
     }

     update() {
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

          this[s_dragControls] = new THREE.DragControls(this[s_camera], this[s_scene].controlPointImpostors.children, this[s_renderer].domElement);
          this[s_dragControls].on('hoveron', function(e) {
               _this[s_transformControls].attach(e.object);
               cancelHideTransform();
          });
          this[s_dragControls].on('hoveroff', function(e) {
               if (e) delayHideTransform();
          });
          this[s_trackballControls].addEventListener('start', cancelHideTransform);
          this[s_trackballControls].addEventListener('end', delayHideTransform);
     }

     animate() {
          requestAnimationFrame(this.animate.bind(this));
          this[s_scene].animate();
          this[s_renderer].render(this[s_scene], this[s_camera]);
          this[s_trackballControls].update();
          this[s_transformControls].update();
     }

     }//class Viewport

     return { Viewport: Viewport };
});


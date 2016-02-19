define([ 'jquery', 'three', 'TrackballControls', 'TransformControls', 'DragControls' ], function($, THREE) {
     class Viewport {
     /*var camera;
     var renderer;

     var trackballControls;
     var dragControls;
     var transformControls;*/

     constructor(s) {
          this.scene = s;

          this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          this.camera.position.z = 20;

          this.trackballControls = new THREE.TrackballControls(this.camera);
          this.trackballControls.target.set(0, 0, 0);

          var canvas = $('#happah')[0];
          var context = canvas.getContext('webgl2');
          context.getExtension('EXT_frag_depth');
          var parameters = { canvas: canvas, context: context };
          this.renderer = new THREE.WebGLRenderer(parameters);
          this.renderer.setClearColor(0xFFFFFF);
          this.renderer.setSize(window.innerWidth, window.innerHeight);
          this.renderer.domElement.addEventListener('mousemove', this.trackballControls.onDocumentMouseMove, false);
          this.renderer.domElement.addEventListener('mousedown', this.trackballControls.onDocumentMouseDown, false);
          this.renderer.domElement.addEventListener('mouseup', this.trackballControls.onDocumentMouseUp, false);

          this.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
          this.scene.add(this.transformControls);
     }

     update() {
          var hiding;
          var _this = this;

          function hideTransform() {
               hiding = setTimeout(function() {
                    _this.transformControls.detach(_this.transformControls.object);
               }, 2500)
          }

          function cancelHideTransform() {
               if (hiding) clearTimeout(hiding);
          }

          function delayHideTransform() {
               cancelHideTransform();
               hideTransform();
          }

          this.dragControls = new THREE.DragControls(this.camera, this.scene.controlPointImpostors.children, this.renderer.domElement);
          this.dragControls.on('hoveron', function(e) {
               _this.transformControls.attach(e.object);
               cancelHideTransform();
          });
          this.dragControls.on('hoveroff', function(e) {
               if (e) delayHideTransform();
          });
          this.trackballControls.addEventListener('start', cancelHideTransform);
          this.trackballControls.addEventListener('end', delayHideTransform);
     }

     animate() {
          requestAnimationFrame(this.animate.bind(this));
          this.scene.animate();
          this.render();
          this.trackballControls.update();
          this.transformControls.update();
     }

     render() {
          this.renderer.render(this.scene.scene, this.camera);//TODO: this.scene.scene ewwwwww!!!
     }
     }
     return { Viewport: Viewport };
});


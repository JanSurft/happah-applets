require.config({
     baseUrl: '../../js',
     shim: {
          'bootstrap': {
               deps: ['jquery']
          },
          'three': {
               exports: 'THREE'
          },
          'TrackballControls': {
               deps: ['three'],
               exports: 'THREE'
          },
          'TransformControls': {
               deps: ['three'],
               exports: 'THREE'
          }
     },
     paths: {
          i18n: "http://rawgit.com/fnando/i18n-js/master/app/assets/javascripts/i18n",
          impromptu: "https://cdn.rawgit.com/trentrichardson/jQuery-Impromptu/master/dist/jquery-impromptu.min",
          mathjax: "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML",
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r83/three",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
          bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap",
     }
});

require(['../lib/happah', '../lib/defaults', '../lib/pointcontrols', 'three', 'jquery'], function(happah, DEFAULTS, CONTROLS, THREE, $) {
     // Canvas element
     var canvas = $('.hph-canvas')[0];
     var scene = new happah.Scene();

     var points = [];
     var impostors = new THREE.Object3D();

     scene.add(impostors);

     // Canvas coordinates relative to middle of canvas element
     var pos = new THREE.Vector3(0, -(1 / 1.2), 0);
     var algorithm = new happah.DeCasteljauAlgorithm(points);
     var viewport = new happah.Viewport(canvas, scene, algorithm);
     var scrollbar = new happah.Scrollbar(pos, viewport);
     algorithm.scrollbar = scrollbar;
     scrollbar.listenTo(viewport.renderer.domElement);
     viewport.overlay.add(scrollbar);
     viewport.camera.position.set(1000, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();

     var dragControls = new happah.DragControls(impostors.children, viewport.controls, viewport.camera);
     dragControls.listenTo(viewport.renderer.domElement);

     var pointControls = new CONTROLS.PointControls(impostors, points, viewport.camera, 0);
     pointControls.listenTo(viewport.renderer.domElement);

     // Initialize some points
     pointControls.addControlPoints([
          new THREE.Vector3(50, 0, -60), new THREE.Vector3(-50, 0, -40),
          new THREE.Vector3(-50, 0, 40), new THREE.Vector3(50, 0, 60)
     ]);

     // Menu & toolbar
     var toolbar = DEFAULTS.Defaults.toolbarMenu(".tool-bar-top");
     var menu = DEFAULTS.Defaults.playerMenu("#hph-controls");
     console.log("happah initialized.");

});

//TODO: simplify vertex shaders
//TODO: move shaders into module
//TODO: move camera from position 0 to position 1 (use quaternion)
//TODO: check spherical impostor implementation; one billboard for all impostors; use drawarrayinstances from webgl2
//TODO: shader preprocessor
//TODO: trackballcontrols: reimplement removing dep on camera
//TODO: single insert() method for all inserts with type variable in object classes
//TODO: webgl2...use features such as instanced arrays
//TODO: data should be only once in memory with flags about how to render it
//TODO: ray/sphere intersection in fragment shader...also important for point manipulation
//TODO: install and use compass

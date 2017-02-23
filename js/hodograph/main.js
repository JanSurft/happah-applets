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

require(['../lib/happah', './algorithm', '../lib/scrollbar', '../lib/pointcontrols', 'three', 'jquery'], function(happah, ALGORITHM, SCROLLBAR, CONTROLS, THREE, $) {
     // Canvas element
     var canvas = $('.hph-canvas')[0];
     var scene = new THREE.Scene();

     // Points & impostors
     var points = [];
     var impostors = new THREE.Object3D();

     scene.add(impostors);

     // Canvas coordinates relative to middle of canvas element
     var pos = new THREE.Vector3(0, -(1 / 1.2), 0);
     var algorithm = new ALGORITHM.Algorithm(points);

     var viewport = new happah.Viewport(canvas, scene, algorithm);

     var scrollbar = new SCROLLBAR.Scrollbar(pos, viewport, 0.2);

     var dragControls = new happah.DragControls(impostors.children, viewport.controls, viewport.camera);
     dragControls.listenTo(viewport.renderer.domElement);

     algorithm.scrollbar = scrollbar;
     scrollbar.listenTo(viewport.renderer.domElement);
     viewport.overlay.add(scrollbar);
     viewport.camera.position.set(0, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.0;
     viewport.camera.updateProjectionMatrix();

     var pointControls = new CONTROLS.PointControls(impostors, points, viewport.camera, 0);
     pointControls.listenTo(viewport.renderer.domElement);

     var origin = new THREE.Vector3(80, 0, 40);

     // Initialize some points
     pointControls.addControlPoints([
          new THREE.Vector3(-30, 0, 40).sub(origin),
          new THREE.Vector3(-20, 0, 0).sub(origin),
          new THREE.Vector3(20, 0, 0).sub(origin),
          new THREE.Vector3(30, 0, 40).sub(origin)
     ]);

     var menu = new happah.Menu(".btn-group", scene, viewport);
     console.log("happah initialized.");
});

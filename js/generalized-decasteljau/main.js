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

require(['../lib/happah', '../lib/defaults', '../lib/multihandlescrollbar', '../lib/controlpolygon', './algorithm', 'three', 'jquery'], function(happah, DEFAULTS, SCROLLBAR, POLY, ALGORITHM, THREE, $) {
     // Canvas element
     let canvas = $('.hph-canvas')[0];
     let scene = new THREE.Scene();

     let viewport = new happah.Viewport(canvas, scene, algorithm);

     let controlPolygon = new POLY.ControlPolygon(scene, viewport.camera, 0);
     controlPolygon.listenTo(viewport.renderer.domElement);

     // Initialize some points
     addControls.addControlPoints([
          new THREE.Vector3(50, 0, 60), new THREE.Vector3(-50, 0, 40),
          new THREE.Vector3(-50, 0, -40), new THREE.Vector3(50, 0, -60)
     ]);
     let algorithm = new ALGORITHM.Algorithm(controlPolygon.vectors);
     viewport.algorithm = algorithm;

     // Canvas coordinates relative to middle of canvas element
     let pos = new THREE.Vector3(0, -(1 / 1.2), 0);

     // Scrollbars
     let scrollbar = new SCROLLBAR.MultiHandleScrollbar(pos, viewport);

     let dragControls = new happah.DragControls(controlPolygon.points.children, viewport.camera);
     dragControls.listenTo(viewport.renderer.domElement);

     algorithm.scrollbar = scrollbar;
     scrollbar.listenTo(viewport.renderer.domElement);

     viewport.overlay.add(scrollbar);
     viewport.camera.position.set(1000, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();


     // Menu & toolbar
     let toolbar = DEFAULTS.Defaults.toolbarMenu(".tool-bar-top");
     let menu = DEFAULTS.Defaults.playerMenu("#hph-controls");

     console.log("happah initialized.");

});

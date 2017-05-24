require.config({
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
          impromptu: "https://cdn.rawgit.com/trentrichardson/jQuery-Impromptu/master/dist/jquery-impromptu.min",
          mathjax: "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
          bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap",
     },
});

require(['../lib/happah', '../lib/defaults', '../lib/controlpolygon', './algorithm', 'three', 'mathjax'], function(happah, DEFAULTS, POLY, PRECISION, THREE) {
     let $ = require('jquery');
     // Canvas element
     $(document).ready(function() {
          let canvas = $('.hph-canvas')[0];
          let scene = new THREE.Scene();

          let viewport = new happah.Viewport(canvas, scene, null);

          let controlPolygon = new POLY.ControlPolygon(scene, viewport.camera, 0);
          controlPolygon.listenTo(viewport.renderer.domElement);

          // Initialize some points
          controlPolygon.addControlPoints([
               new THREE.Vector3(50, 0, -100),
               new THREE.Vector3(50, 60, -80),
               new THREE.Vector3(50, 60, 80),
               new THREE.Vector3(50, 0, 100),
          ]);
          let algorithm = new PRECISION.Algorithm(controlPolygon.vectors);
          viewport.algorithm = algorithm;

          // Canvas coordinates relative to middle of canvas element
          let pos = new THREE.Vector3(0, -(1 / 1.2), 0);
          let scrollbar = new happah.Scrollbar(pos, viewport);
          algorithm.scrollbar = scrollbar;
          scrollbar.listenTo(viewport.renderer.domElement);
          viewport.overlay.add(scrollbar);
          viewport.camera.position.set(1000, 1000, 0);
          viewport.camera.lookAt(scene.position);
          viewport.camera.zoom = 2.5;
          viewport.camera.updateProjectionMatrix();

          let dragControls = new happah.DragControls(controlPolygon.points.children, viewport.camera);
          dragControls.listenTo(viewport.renderer.domElement);

          // Menu & toolbar
          let toolbar = DEFAULTS.Defaults.toolbarMenu(".tool-bar-top");
          let menu = DEFAULTS.Defaults.playerMenu("#hph-controls");

          console.log("happah initialized.");
     });
});

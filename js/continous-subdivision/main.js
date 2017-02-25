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

require(['../lib/happah', '../lib/defaults', '../lib/pointcontrols', './algorithm', 'three', 'mathjax'], function(happah, DEFAULTS, CONTROLS, PRECISION, THREE) {
     var $ = require('jquery');
     // Canvas element
     $(document).ready(function() {
          var canvas = $('.hph-canvas')[0];
          var scene = new happah.Scene();

          var points = [];
          var impostors = new THREE.Group();
          scene.add(impostors);

          // Canvas coordinates relative to middle of canvas element
          var pos = new THREE.Vector3(0, -(1 / 1.2), 0);
          var algorithm = new PRECISION.Algorithm(points);
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

          var addControls = new CONTROLS.PointControls(impostors, points, viewport.camera, 0);
          addControls.listenTo(viewport.renderer.domElement);

          // Initialize some points
          addControls.addControlPoints([
               new THREE.Vector3(50, 0, -100),
               new THREE.Vector3(50, 60, -80),
               new THREE.Vector3(50, 60, 80),
               new THREE.Vector3(50, 0, 100),
          ]);
          // Menu & toolbar
          var toolbar = DEFAULTS.Defaults.toolbarMenu(".tool-bar-top");
          var menu = DEFAULTS.Defaults.playerMenu("#hph-controls");

          console.log("happah initialized.");
     });
});

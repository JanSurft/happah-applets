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
          i18n: "http://rawgit.com/fnando/i18n-js/master/app/assets/javascripts/i18n",
          impromptu: "https://cdn.rawgit.com/trentrichardson/jQuery-Impromptu/master/dist/jquery-impromptu.min",
          mathjax: "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML",
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "http://threejs.org/build/three",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
          bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap",
     },
     baseUrl: '../../js',
});

require(['./lib/happah', './lib/addcontrols', './precision/algorithm', 'three', 'jquery', 'bootstrap', 'impromptu', 'mathjax'], function(happah, ADDCONTROLS, PRECISION, THREE, $) {
     // Canvas element
     var canvas = $('.hph-canvas')[0];
     var scene = new happah.Scene();

     // Canvas coordinates relative to middle of canvas element
     var pos = new THREE.Vector3(0, -(1 / 1.2), 0);
     var algorithm = new PRECISION.Algorithm(scene.controlPoints);
     var viewport = new happah.Viewport(canvas, scene, algorithm, {
          enableDragcontrols: false
     });
     var scrollbar = new happah.Scrollbar(pos, viewport);
     algorithm.scrollbar = scrollbar;
     scrollbar.listenTo(viewport.renderer.domElement);
     viewport.overlay.add(scrollbar);
     viewport.camera.position.set(1000, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();

     var addControls = new ADDCONTROLS.AddControls(viewport, scene, viewport.camera, 0);
     addControls.listenTo(viewport.renderer.domElement);

     // Initialize some points
     addControls.addControlPoints([
          new THREE.Vector3(50, 0, 100),
          new THREE.Vector3(50, 0, 50),
          new THREE.Vector3(50, 0, 0),
          new THREE.Vector3(50, 0, -50),
          new THREE.Vector3(50, 0, -100),
     ]);
     var menu = new happah.Menu(".btn-group", scene, viewport);
     console.log("happah initialized.");

});

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
          three: "http://threejs.org/build/three",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
          bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap",
     }
});

require(['./lib/happah', './lib/addcontrols', './generalizedDecasteljau/algorithm', 'three', 'jquery', 'bootstrap', 'impromptu', 'mathjax'], function(happah, ADDCONTROLS, ALGORITHM, THREE, $) {
     // Canvas element
     var canvas = $('.hph-canvas')[0];
     var scene = new happah.Scene();
     // TODO: Get position relative to window size
     var algorithm = new ALGORITHM.Algorithm(scene.controlPoints);
     var viewport = new happah.Viewport(canvas, scene, algorithm);

     // Scrollbars
     var scrollbar = new happah.Scrollbar(new THREE.Vector3(170, -30, -120), viewport);
     var scrollbar2 = new happah.Scrollbar(new THREE.Vector3(170, -30, -100), viewport);
     var scrollbar3 = new happah.Scrollbar(new THREE.Vector3(170, -30, -80), viewport);

     var dragControls = new happah.DragControls(scene, viewport.controls, viewport.camera);
     dragControls.listenTo(viewport.renderer.domElement);

     algorithm.scrollbars = [scrollbar, scrollbar2, scrollbar3];
     scrollbar.listenTo(viewport.renderer.domElement);
     scrollbar2.listenTo(viewport.renderer.domElement);
     scrollbar3.listenTo(viewport.renderer.domElement);

     var addControls = new ADDCONTROLS.AddControls(viewport, scene, viewport.camera, 0);
     addControls.listenTo(viewport.renderer.domElement);

     viewport.overlay.add(scrollbar);
     viewport.overlay.add(scrollbar2);
     viewport.overlay.add(scrollbar3);
     viewport.camera.position.set(1000, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();

     // Initialize some points
     addControls.addControlPoints([
          new THREE.Vector3(50, 0, -60), new THREE.Vector3(-50, 0, -40),
          new THREE.Vector3(-50, 0, 40), new THREE.Vector3(50, 0, 60)
     ]);
     var menu = new happah.Menu(".btn-group", scene, viewport);
     console.log("happah initialized.");

});
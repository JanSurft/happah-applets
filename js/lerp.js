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

require(['./lib/happah', './lib/pointcontrols', 'three', 'jquery', 'bootstrap', 'impromptu', 'mathjax'], function(happah, CONTROLS, THREE, $) {
     var scene = new happah.Scene();

     var points = [];
     var impostors = new THREE.Object3D();
     scene.add(impostors);

     var algorithm = new happah.DeCasteljauAlgorithm(points);
     var viewport = new happah.Viewport($('.hph-canvas')[0], scene, algorithm);

     // Canvas coordinates relative to middle of canvas element
     var pos = new THREE.Vector3(0, -(1 / 1.2), 0);
     var scrollbar = new happah.Scrollbar(pos, viewport);

     algorithm.scrollbar = scrollbar;
     var dragControls = new happah.DragControls(impostors.children, viewport.controls, viewport.camera);
     dragControls.listenTo(viewport.renderer.domElement);
     scrollbar.listenTo(viewport.renderer.domElement);
     viewport.overlay.add(scrollbar);
     viewport.camera.position.set(1000, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();

     var addControls = new CONTROLS.PointControls(impostors, points, viewport.camera, 2);
     addControls.listenTo(viewport.renderer.domElement);

     // Initialize some points
     addControls.addControlPoints([
          new THREE.Vector3(0, 0, 66),
          new THREE.Vector3(0, 0, -66)
     ]);
     var menu = new happah.Menu(".btn-group", scene, viewport);
     console.log("happah initialized.");

});

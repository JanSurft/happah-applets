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
          i18n: "http://rawgithubusercontent.com/fnando/i18n-js/master/app/assets/javascripts/i18n",
          impromptu: "https://cdn.rawgit.com/trentrichardson/jQuery-Impromptu/master/dist/jquery-impromptu.min",
          mathjax: "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML",
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "http://threejs.org/build/three",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
          bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap",
     }
});

require(['./lib/happah', 'three', 'jquery', 'bootstrap', 'impromptu', 'mathjax'], function(happah, THREE, $) {
     var scene = new happah.Scene();
     var algorithm = new happah.DeCasteljauAlgorithm(scene.controlPoints);
     var viewport = new happah.Viewport($('.hph-canvas')[0], scene, algorithm);
     var scrollbar = new happah.Scrollbar(new THREE.Vector3(0, -30, 100), viewport);
     algorithm.scrollbar = scrollbar;
     var drawControls = new happah.DragControls(scene, viewport.controls, viewport.camera);
     dragControls.listenTo(viewport.renderer.domElement);
     scrollbar.listenTo(viewport.renderer.domElement);
     viewport.overlay.add(scrollbar);
     viewport.camera.position.set(1000, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();
     // Limit amount of controlpoints
     viewport.addControls.limit = 2;
     // Initialize some points
     viewport.addControls.addControlPoints([
          new THREE.Vector3(0, 0, 66),
          new THREE.Vector3(0, 0, -66)
     ]);
     var menu = new happah.Menu(".btn-group", scene, viewport);
     console.log("happah initialized.");

});

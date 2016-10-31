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
          i18n: "http://raw.githubusercontent.com/fnando/i18n-js/master/app/assets/javascripts/i18n",
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
     // Canvas element
     var canvas = $('.hph-canvas')[0];
     var scene = new happah.Scene();
     // TODO: Get position relative to window size
     var pos = new THREE.Vector3(0, -30, 100);
     var algorithm = new happah.DeCasteljauAlgorithm(scene.controlPoints);
     var viewport = new happah.Viewport(canvas, scene, algorithm);
     var scrollbar = new happah.Scrollbar(pos, viewport);
     var scrollbar2 = new happah.Scrollbar(new THREE.Vector3(150, -30, 0), viewport);
     algorithm.scrollbar = scrollbar;
     scrollbar.listenTo(viewport.renderer.domElement);
     scrollbar2.listenTo(viewport.renderer.domElement);
     viewport.overlay.add(scrollbar);
     viewport.overlay.add(scrollbar2);
     viewport.camera.position.set(1000, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();
     viewport.addControls.addControlPoints([
          new THREE.Vector3(-50, 0, -30), new THREE.Vector3(-40, 0, 30)
     ]);
     var menu = new happah.Menu(".btn-group", scene, viewport);
     console.log("happah initialized.");

});

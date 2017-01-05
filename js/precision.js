require.config({
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

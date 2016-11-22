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

require(['./lib/happah', './lib/addcontrols', './bernsteinPolynomials/algorithm', 'three', 'jquery', 'bootstrap', 'impromptu', 'mathjax'], function(happah, ADDCONTROLS, ALGORITHM, THREE, $) {
     // Canvas element
     var canvas = $('.hph-canvas')[0];
     var scene = new happah.Scene();
     // TODO: Get position relative to window size
     var pos = new THREE.Vector3(0, -30, 100);
     var algorithm = new ALGORITHM.Algorithm(new THREE.Vector3(-50, 0, +50));
     var viewport = new happah.Viewport(canvas, scene, algorithm);
     //var scrollbar = new happah.Scrollbar(pos, viewport);
     //var dragControls = new happah.DragControls(scene, viewport.controls, viewport.camera);
     //dragControls.listenTo(viewport.renderer.domElement);
     //algorithm.scrollbar = scrollbar;
     //scrollbar.listenTo(viewport.renderer.domElement);
     //viewport.overlay.add(scrollbar);
     viewport.camera.position.set(0, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();

     //var addControls = new ADDCONTROLS.AddControls(viewport, scene, viewport.camera, 0);
     //addControls.listenTo(viewport.renderer.domElement);

     // Create a frame
     // X-Axis
     var geometry = new THREE.CylinderGeometry(1, 1, 190, 16);
     var coneGeo = new THREE.CylinderGeometry(0, 3, 8, 5, 16);
     coneGeo.rotateZ(-Math.PI / 2);
     coneGeo.translate(95, 0, 0);
     geometry.rotateZ(Math.PI / 2);
     geometry.merge(coneGeo);

     var secondGeometry = new THREE.CylinderGeometry(1, 1, 110, 16);
     secondGeometry.rotateZ(Math.PI / 2);
     secondGeometry.rotateY(Math.PI / 2);
     secondGeometry.translate(-50, 0, -55);
     geometry.merge(secondGeometry);
     secondGeometry.translate(100, 0, 0);
     geometry.merge(secondGeometry);
     var material = new THREE.MeshBasicMaterial({
          color: 0x4d4d4d
     });
     var frame = new THREE.Mesh(geometry, material);
     frame.position.set(0, 0, 50);
     scene.add(frame);

     // Add labels
     viewport.labelManager.addLabel("0", new THREE.Vector3(-52, 0, 55), "axis", false);
     viewport.labelManager.addLabel("1", new THREE.Vector3(60, 0, 55), "axis", false);


     // Initialize some points
     //addControls.addControlPoints([
     //new THREE.Vector3(-50, 0, -50),
     //new THREE.Vector3(-50, 0, 50),
     //new THREE.Vector3(-25, 0, 50),
     //new THREE.Vector3(0, 0, 50),
     //new THREE.Vector3(25, 0, 50),
     //new THREE.Vector3(50, 0, 50),
     //]);

     var menu = new happah.Menu(".btn-group", scene, viewport);
     console.log("happah initialized.");

});

//TODO: animate? why not just paint?
//TODO: take animate out of scene
//TODO: fix fragDepth
//TODO: simplify vertex shaders
//TODO: move shaders into module
//TODO: move camera from position 0 to position 1 (use quaternion)
//TODO: check spherical impostor implementation; one billboard for all impostors; use drawarrayinstances from webgl2
//TODO: shader preprocessor
//TODO: trackballcontrols: reimplement removing dep on camera
//TODO: single insert() method for all inserts with type variable in object classes
//TODO: webgl2...use features such as instanced arrays
//TODO: data should be only once in memory with flags about how to render it
//TODO: event-based rendering instead of infinite loop
//TODO: ray/sphere intersection in fragment shader...also important for point manipulation
//TODO: interval overlay for choosing ratio in de casteljau algorithm
//TODO: install and use compass

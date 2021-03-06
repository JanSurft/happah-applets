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

require(['../lib/happah', '../lib/defaults', './algorithm', '../lib/controlpolygon', './linedragcontrols', 'three', 'jquery'], function(happah, DEFAULTS, ALGORITHM, POLY, CONTROLS, THREE, $) {

     // Canvas element
     let canvas = $('.hph-canvas')[0];
     let scene = new THREE.Scene();

     let viewport = new happah.Viewport(canvas, scene, null);
     let controlPolygon = new POLY.ControlPolygon(scene, viewport.camera, 0);
     controlPolygon.listenTo(viewport.renderer.domElement);

     // Initialize some points
     controlPolygon.addControlPoints([
          new THREE.Vector3(-80, 0, 50),
          new THREE.Vector3(-40, 0, -30),
          new THREE.Vector3(0, 0, -50),
          new THREE.Vector3(40, 0, -100),
          new THREE.Vector3(80, 0, -70)
     ]);
     let algorithm = new ALGORITHM.Algorithm(controlPolygon.vectors);
     viewport.algorithm = algorithm;

     let dragControls = new CONTROLS.LineDragControls(controlPolygon.points.children, viewport.camera);
     dragControls.listenTo(viewport.renderer.domElement);

     // Canvas coordinates relative to middle of canvas element
     let pos = new THREE.Vector3(0, -(1 / 1.2), 0);
     let scrollbar = new happah.Scrollbar(pos, viewport);
     algorithm.scrollbar = scrollbar;
     algorithm.camera = viewport.camera;
     scrollbar.listenTo(viewport.renderer.domElement);
     viewport.overlay.add(scrollbar);
     viewport.camera.position.set(0, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 2.5;
     viewport.camera.updateProjectionMatrix();

     // X-Axis
     let geometry = new THREE.CylinderGeometry(1, 1, 190, 32);
     let coneGeo = new THREE.CylinderGeometry(0, 3, 8, 5, 1);
     coneGeo.rotateZ(-Math.PI / 2);
     coneGeo.translate(95, 0, 0);
     geometry.rotateZ(Math.PI / 2);
     geometry.merge(coneGeo);
     let material = new THREE.MeshBasicMaterial({
          color: 0x4d4d4d
     });
     axis = new THREE.Mesh(geometry, material);
     axis.position.set(0, 0, 60);
     scene.add(axis);

     // Menu & toolbar
     let toolbar = DEFAULTS.Defaults.toolbarMenu(".tool-bar-top");
     let menu = DEFAULTS.Defaults.playerMenu("#hph-controls");

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

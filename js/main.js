require.config({
     baseUrl: 'js',
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
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "http://threejs.org/build/three",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
          bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap"
               //shader: '../lib/shader',
               //shaders: '../shaders'
     }
});

require(['happah', 'three', 'jquery', 'bootstrap'], function(happah, THREE, $) {
     var scene = new happah.Scene();
     scene.addControlPoints([
          new THREE.Vector3(-50, 0, -30), new THREE.Vector3(-40, 0, 30),
          new THREE.Vector3(40, 0, 30), new THREE.Vector3(50, 0, -30),
     ]);

     var storyboard = new happah.Storyboard();
     var algorithm = new happah.Curve(scene.controlPoints);
     var viewport = new happah.Viewport($('.hph-canvas')[0], scene, algorithm);
     //scene.algorithm = deCasteljau;
     //scene.algorithm = new happah.Curve(scene.controlPoints);

     viewport.animate();

     // TEST
     var i = new happah.Menu(".dropdown-menu", scene, viewport);
     var l = new happah.Menu(".btn-group", scene, viewport);
     console.log("happah initialized.");



     var defaults = {
          algorithm: 'De Casteljau',
          Rekursionstiefe: 2
     };
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

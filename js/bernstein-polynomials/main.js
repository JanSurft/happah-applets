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

require(['../lib/happah', '../lib/defaults', './algorithm', 'three', 'jquery'], function(happah, DEFAULTS, ALGORITHM, THREE, $) {
     // Canvas element
     var canvas = $('.hph-canvas')[0];
     var scene = new happah.Scene();

     var algorithm = new ALGORITHM.Algorithm(new THREE.Vector3(-50, 0, +50));
     var viewport = new happah.Viewport(canvas, scene, algorithm);
     viewport.camera.position.set(0, 1000, 0);
     viewport.camera.lookAt(scene.position);
     viewport.camera.zoom = 4;
     viewport.camera.updateMatrixWorld();
     viewport.camera.updateProjectionMatrix();

     // Create a frame
     // X-Axis
     var geometry = new THREE.CylinderGeometry(0.5, 0.5, 130, 16);
     var coneGeo = new THREE.CylinderGeometry(0, 2, 6, 5, 16);
     coneGeo.rotateZ(-Math.PI / 2);
     coneGeo.translate(68, 0, 0);
     geometry.rotateZ(Math.PI / 2);
     geometry.merge(coneGeo);

     var secondGeometry = new THREE.CylinderGeometry(0.5, 0.5, 101, 16);
     secondGeometry.rotateZ(Math.PI / 2);
     secondGeometry.rotateY(Math.PI / 2);
     secondGeometry.translate(-50, 0, -50);
     geometry.merge(secondGeometry);
     secondGeometry.translate(100, 0, 0);
     geometry.merge(secondGeometry);

     var thirdGeometry = new THREE.CylinderGeometry(0.5, 0.5, 101, 16);
     thirdGeometry.rotateZ(-Math.PI / 2);
     thirdGeometry.translate(0, 0, -100);
     geometry.merge(thirdGeometry);
     var material = new THREE.MeshBasicMaterial({
          color: 0x4d4d4d
     });
     var frame = new THREE.Mesh(geometry, material);
     frame.position.set(0, 0, 50);
     scene.add(frame);

     // Add labels
     viewport.labelManager.addLabel("0", new THREE.Vector3(-52, 0, 50), "axis", false);
     viewport.labelManager.addLabel("1", new THREE.Vector3(55, 0, 50), "axis", false);
     viewport.labelManager.addLabel("1", new THREE.Vector3(-52, 0, -55), "axis", false);

     // Buttons
     var menu = DEFAULTS.Defaults.playerMenu("#hph-controls");
     var toolbar = new happah.Menu(".tool-bar-top");
     toolbar.addButton("Toggle grid", "grid-toggle", "fa-th", "Grid");
     toolbar.addButton("Start Tour", "show-help", "fa-info", "Guide");

     console.log("happah initialized.");

});

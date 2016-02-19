require.config({
     baseUrl: 'js',
     shim: {
          'three': { exports: 'THREE' },
          'TrackballControls': { deps: ['three'], exports: 'THREE' },
          'TransformControls': { deps: ['three'], exports: 'THREE' },
          'DragControls': { deps: ['three'], exports: 'THREE' }
     },
     paths: {
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "http://threejs.org/build/three",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
          DragControls: "http://threejs.org/examples/js/controls/DragControls"
          //shader: '../lib/shader',
          //shaders: '../shaders'
     }
});

require([ 'happah', 'three' ], function (happah, THREE) {
     var scene = new happah.Scene();
     scene.algorithm = HAPPAH.algorithms.deCasteljau;
     for (i = 0; i < 3; i++) scene.addControlPoint(new THREE.Vector3(i / 2, i * 3, Math.sin(i)));//TODO: get rid of THREE
     var viewport = new happah.Viewport(scene);
     viewport.update();
     viewport.animate();
     console.log("happah initialized.");
});


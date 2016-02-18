require.config({
     baseUrl: 'js',
     shim: {
          'three': { exports: 'THREE' },
          'TrackballControls': { deps: ['three'], exports: 'THREE' },
          'Projector': { deps: ['three'], exports: 'THREE' },
          'TransformControls': { deps: ['three'], exports: 'THREE' },
          'DragControls': { deps: ['three'], exports: 'THREE' }
     },
     paths: {
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "http://threejs.org/build/three",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          Projector: "http://threejs.org/examples/js/renderers/Projector",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
          DragControls: "http://threejs.org/examples/js/controls/DragControls"
          //shader: '../lib/shader',
          //shaders: '../shaders'
     }
});

require([ 'happah' ], function (happah) {
     var gui = new happah.GUI;
     gui.init();
     gui.setAlgorithm(HAPPAH.algorithms.deCasteljau);
     gui.animate();
});


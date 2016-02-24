require.config({
     baseUrl: 'js',
     shim: {
          'dat': { exports: 'dat' },
          'DragControls': { deps: ['three'], exports: 'THREE' },
          'three': { exports: 'THREE' },
          'TrackballControls': { deps: ['three'], exports: 'THREE' },
          'TransformControls': { deps: ['three'], exports: 'THREE' }
     },
     paths: {
          dat: "https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.5.1/dat.gui.min",//TODO: remove
          DragControls: "http://threejs.org/examples/js/controls/DragControls",
          jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
          three: "http://threejs.org/build/three",
          TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
          TransformControls: "http://threejs.org/examples/js/controls/TransformControls"
          //shader: '../lib/shader',
          //shaders: '../shaders'
     }
});

function deCasteljau(params) {
     var DEFAULTS = {
          controlPoints1D: [],
          recursionDepth: 1,
     }

     // if no parameters are given use dafaults
     var par = $.extend({}, DEFAULTS, params);

     var points = [];

     // copy control points for first iteration.
     for (i = 0; i < par['controlPoints1D'].length; i++) {
          points[i] = par['controlPoints1D'][i];
     }

     for (j = 0; j < par['recursionDepth']; j++) {
          var tempPoints = [];
          // The first control point does not change.
          tempPoints[0] = points[0];
          // Get the middle of each segment and make it a new point.
          for (i = 0; i < points.length - 1; i++) {
               tempPoints[i + 1] = new THREE.Vector3(
                    (points[i + 1].x + points[i].x) / 2, (points[i + 1].y + points[i].y) / 2, (points[i + 1].z + points[i].z) / 2
               );
          }
          // The last control point remains unchanged.
          tempPoints[tempPoints.length] = points[points.length - 1];
          // Set points array for next iteration.
          points = tempPoints;
     }

     return points;
}
require([ 'happah', 'dat', 'three' ], function (happah, dat, THREE) {
     var scene = new happah.Scene();
     var viewport = new happah.Viewport($('.hph-canvas')[0], scene);
     scene.algorithm = deCasteljau;
     for (i = 0; i < 3; i++) scene.addControlPoint(new THREE.Vector3(i / 2, i * 3, Math.sin(i)));//TODO: get rid of THREE
     viewport.animate();
     console.log("happah initialized.");

     var storyboard = new happah.Storyboard();
     var frame0 = new happah.Storyboard.Frame();
     storyboard.append(frame0);

     var defaults = {
          algorithm: 'De Casteljau',
          Rekursionstiefe: 0
     };
     var controls = new dat.GUI();
     controls.add(defaults, 'algorithm');
     controls.add(defaults, 'Rekursionstiefe', 0, 100);
});

//TODO: animate? why not just paint?
//TODO: take algorithm stuff out of scene
//TODO: take animate out of scene
//TODO: fix fragDepth
//TODO: simplify vertex shaders
//TODO: move shaders into module
//TODO: move camera from position 0 to position 1 (use quaternion)
//TODO: fix annoying timeout on drag controls
//TODO: check spherical impostor implementation; one billboard for all impostors; use drawarrayinstances from webgl2
//TODO: shader preprocessor
//TODO: trackballcontrols: reimplement removing dep on camera
//TODO: single insert() method for all inserts with type variable in object classes
//TODO: webgl2...use features such as instanced arrays
//TODO: data should be only once in memory with flags about how to render it
//TODO: remove animate form scene
//TODO: event-based rendering instead of infinite loop
//TODO: ray/sphere intersection in fragment shader...also important for point manipulation
//TODO: interval overlay for choosing ratio in de casteljau algorithm
//TODO: install and use compass


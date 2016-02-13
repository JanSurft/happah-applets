/**
 * Holds default values for simple viewport setup.
 */
HAPPAH.GUI_DEFAULTS = {
     getScene: function() {
          return new THREE.Scene();
     },

     getCamera: function( /* options */ ) {
          var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          //camera.position.y = 20;

          return camera;
     },

     getRenderer: function( /* options */ ) {
          renderer = new THREE.WebGLRenderer();
          renderer.setClearColor(0xFFFFFF);
          return renderer;
     },

     getGrid: function() {
          return new THREE.GridHelper(100, 10);
     },

     getControls: function(camera) {
          // TODO: Remove all references to THREE->Examples!
          //return new THREE.TrackballControls(camera);
          return new THREE.TrackballControls(camera);
     },

     getDummyAlgorithm: function() {
          return function(points, value) {
               return points;
          };
     },

     getLights: function() {
          var lights = new THREE.Object3D();
          var light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(0, 200, 0);
          lights.add(light);
          light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(100, 200, 100);
          lights.add(light);
          light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(-100, -200, -100);
          lights.add(light);
          lights.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
          lights.add(new THREE.AmbientLight(0x000000));
          return lights;
     }
};

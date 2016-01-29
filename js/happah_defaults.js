/**
 * Holds default values for simple viewport setup.
 */
var DEFAULTS = {
     getScene: function() {
          return new THREE.Scene();
     },

     getCamera: function(/* options */) {
          return new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
     },

     getRenderer: function(/* options */) {
          return new THREE.WebGLRenderer();
     },

     getGrid: function() {
          return new THREE.GridHelper(100, 10);
     },

     getControls: function(camera) {
          return new THREE.TrackballControls(camera);
     },

     getLight: function(color) {
          return new THREE.AmbientLight(color);
     }
};

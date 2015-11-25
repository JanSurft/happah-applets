var happah = {
  scene: function(/*options*/) {
    // Create new scene.
    var scene = new THREE.Scene();

    // Add optional values
    // scene.add();

    // Return the final scene.
    return scene;
  },

  init: function() {
    var scene = this.scene();
    var camera = DEFAULTS.camera;
    console.log("happa initialized.");
    return;
  },

  DEFAULTS :  {
    // Default perspective camera.
    camera: new THREE.PerspectiveCamera(75, window.innerWidth /window.innerHeight, 0.1, 1000);

    // Controls:
    // TODO
    // Default grid.
    grid: new THREE.GridHelper(100, 10);
  }
}

// TODO Remove global variables!
var _cam;
var _scene;
var _renderer;
var _controls;


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
    var camera = DEFAULTS.getCamera();
    var renderer = DEFAULTS.getRenderer();
    var controls = DEFAULTS.getControls(camera);
    var grid = DEFAULTS.getGrid();
    _scene = scene;
    _cam = camera;
    _renderer = renderer;
    _controls = controls;
    scene.add(grid);

    // Standard settings
    camera.position.z = 20;
    controls.target.set( 0,0,0);

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append to document.
    document.body.appendChild(renderer.domElement);
    console.log("happah initialized.");
  },

  drawPointCloud: function(points) {
    //TODO: points should be circles not squares
    var pointGeometry = new THREE.Geometry();
    var material = new THREE.PointCloudMaterial( { size: 3, sizeAttenuation: false });
    var pointCloud = new THREE.PointCloud(pointGeometry, material);

    for (i = 0; i < points.length; i++) {
      console.log("pushing point at: " + points[i][0] + points[i][1] + points[i][2]);
      pointGeometry.vertices.push(new THREE.Vector3(points[i][0], points[i][1], points[i][2]));
    }
    _scene.add(pointCloud);

  },

  objects: function() {
    //TODO: get objects from memory somehow
  },

  render: function(objects) {
    requestAnimationFrame( happah.render );
    _controls.update();
    _renderer.render(_scene, _cam);
  },

  addObjectToScene: function(object) {
    //scene.add(object);
  }

}

/**
 * Holds default values for simple viewport setup.
 */
var DEFAULTS = {
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

/* // Different approach
var DEFAULTS = [
  // Default perspective camera.
  "new THREE.PerspectiveCamera(75, window.innerWidth /window.innerHeight, 0.1, 1000)",

  // Default renderer.
  "new THREE.WebGLRenderer()",

  // Default controls
  "new THREE.TrackballControls(camera)",

  // Default grid.
  "new THREE.GridHelper(100, 10)"

];
*/

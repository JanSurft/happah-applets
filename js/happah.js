var controls;

var happah = {
  scene: function(/*options*/) {
    // Create new scene.
    var scene = new THREE.Scene();

    // Add optional values
    // scene.add();

    // Return the final scene.
    return scene;
  },

  /**
   * Initializes with standard settings,
   * such as: 1 camera, 1 scene, 1 renderer.
   */
  init: function() {
    var scene = this.scene();
    var camera = DEFAULTS.getCamera();
    var renderer = DEFAULTS.getRenderer();
    var controls = DEFAULTS.getControls(camera);

    // Grid for testing purposes.
    var grid = DEFAULTS.getGrid();
    scene.add(grid);

    // Standard settings
    camera.position.z = 20;
    controls.target.set( 0,0,0);

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append to document.
    document.body.appendChild(renderer.domElement);
    console.log("happah initialized.");
  },



  /**
   * Draws an array of points.
   */
  drawPointCloud: function(points) {
    //TODO: points should be circles not squares
    var pointGeometry = new THREE.Geometry();
    var material = new THREE.PointCloudMaterial( { size: 3, sizeAttenuation: false });
    var pointCloud = new THREE.PointCloud(pointGeometry, material);

    // Adds all the points to pointgeometry.
    for (i = 0; i < points.length; i++) {
      pointGeometry.vertices.push(new THREE.Vector3(points[i][0],
            points[i][1],
            points[i][2]));
    }
    // Connect the points with lines.
    var line = new THREE.Line(pointGeometry,
        new THREE.LineBasicMaterial({color:0xccafff, opacity: 0.5 }));

    // Add to scene:
    happah.scene.add(line);
    happah.scene.add(pointCloud);

  },

  objects: function() {
    //TODO: get objects from memory somehow
  },

  // Renders the scene in each renderer.
  render: function(renderer, controls) {
    requestAnimationFrame(happah.render);

    // Update the controls. FIXME: works only @ first call.
    // probably something with 'requestAnimationFrame'
    // (render does not take arguments there..)
    this.controls.update();

    for (i = 0; i < renderer.length; i++) {
      renderer[i].render(happah.scene, happah.cam);
    }
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

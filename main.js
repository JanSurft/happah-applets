
// State of the camera.
var isOrthographic = false;


// Camera for main viewport.
var camera;

// Renderer to render the scene.
var renderer;

// Dot mesh.
var dotGeometry;
var dotMaterial;
var dots;

// The main grid for orientation.
var grid;

// TODO has no effect yet.
var light;

// Initializes with default values.
var initialize = function () {
  switchPerspective();
  renderer = new THREE.WebGLRenderer();
  scene = new THREE.Scene();
  dotGeometry = new THREE.Geometry();
  dotMaterial = new THREE.PointCloudMaterial( { size: 3, sizeAttenuation: false } );
  dots = new THREE.PointCloud( dotGeometry, dotMaterial );
  grid = new THREE.GridHelper(100, 10);
  light = new THREE.AmbientLight( 0x404040 ); // Soft white light.

  // 3D mouse controls from: examples/js/controls/OrbitControls.js
  controls = new THREE.TrackballControls( camera );
  controls.target.set( 0, 0, 0 );
  scene.add( dots );
  scene.add( grid );
  scene.add( light );

  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  camera.position.z = 5;
}

// Switches between perspective/orthographic camera. TODO: bind to key.
var switchPerspective = function () {
  if (!isOrthographic) {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  } else {

    camera = new THREE.OrthographicCamera(
        window.innerWidth / - 16, window.innerWidth / 16,window.innerHeight/ 16, window.innerHeight / - 16, -200, 500);
  }
  // Switch value.
  isOrthographic = !isOrthographic;

  camera.position.z = 20;
}

// Draws a single point to the given coordinates.
function drawPoint(x, y, z) {
  dotGeometry.vertices.push(new THREE.Vector3( x, y, z));
}

// Renders the scene.
var render = function() {
  requestAnimationFrame( render);
  controls.update();
  renderer.render(scene, camera);
};

initialize();
render();

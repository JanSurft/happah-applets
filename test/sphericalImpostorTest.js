gui = function() {
     var scene;
     var camera;
     var renderer;
     var spheres;
     var controls;
     var grid;
     var lights;

     this.init = function() {
          scene = GUI_DEFAULTS.getScene();
          camera = GUI_DEFAULTS.getCamera();
          renderer = GUI_DEFAULTS.getRenderer();
          spheres = new THREE.Object3D();
          controls = GUI_DEFAULTS.getControls(camera);
          grid = GUI_DEFAULTS.getGrid();
          lights = GUI_DEFAULTS.getLights();

          // create sphere objects in a group
          for (var i = -10; i <= 10; i++) {
               for (var j = -10; j <= 10; j++) {
                    var sphere = HAPPAH.SphericalImpostor();
                    sphere.position.set(5. * i, 0, 5. * j);
                    if (i == 0 && j == 0) {
                         sphere.material.uniforms.diffuse.value.set(
                              new THREE.Color(0x009D82));
                    }
                    spheres.add(sphere);
               }
          }

          // add all elements to the scene
          for (var i = 0; i < lights.length; i++) {
               scene.add(lights[i]);
          }
          scene.add(grid);
          scene.add(spheres);

          camera.position.z = 20;
          controls.target.set(0, 0, 0);

          renderer.setSize(window.innerWidth, window.innerHeight);
          document.body.appendChild(renderer.domElement);

          console.log("happah initialized.");
     }

     this.render = function() {
          requestAnimationFrame(this.render.bind(this));
          controls.update();
          renderer.render(scene, camera);
     }
}

var GUI_DEFAULTS = {
     getScene: function() {
          return new THREE.Scene();
     },

     getCamera: function( /* options */ ) {
          return new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
     },

     getRenderer: function( /* options */ ) {
          return new THREE.WebGLRenderer({
               antialias: true
          });
     },

     getGrid: function() {
          return new THREE.GridHelper(100, 10);
     },

     getControls: function(camera) {
          return new THREE.TrackballControls(camera);
     },

     getLights: function() {
          var lights = [];
          var light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(0, 200, 0);
          lights.push(light);
          light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(100, 200, 100);
          lights.push(light);
          light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(-100, -200, -100);
          lights.push(light);
          lights.push(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
          lights.push(new THREE.AmbientLight(0x000000));
          return lights;
     }
};

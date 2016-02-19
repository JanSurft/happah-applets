define([ 'jquery', 'three' ], function($, THREE) {
     class Scene {

     /*var _scene;
     var grid;
     var light;

     // The new position we want the object to move to.
     var targetposition;
     var p3subp1;

     // For plane intersection
     var raycaster;

     // For moving the points:
     var algorithm;
     var mouseVec;
     var offset;
     var mouseDown;
     var algorithmPoints = [];
     var algorithmLine;
     var controlLine;
     var controlPoints = [];
     this._controlPointImpostors = null;*/

     constructor() {
          this._scene = new THREE.Scene();
          this.mouseVec = new THREE.Vector3();
          this.offset = new THREE.Vector3();
          this.targetposition = new THREE.Vector3();
          this.p3subp1 = new THREE.Vector3();
          this._algorithm = function(points, value) {
               return points;
          };
          this.controlPoints = [];
          this.algorithmPoints = [];
          this._controlPointImpostors = new THREE.Object3D();

          this.grid = new THREE.GridHelper(100, 10);

          this.lights = new THREE.Object3D();
          var light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(0, 200, 0);
          this.lights.add(light);
          light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(100, 200, 100);
          this.lights.add(light);
          light = new THREE.PointLight(0xffffff, 1, 0);
          light.position.set(-100, -200, -100);
          this.lights.add(light);
          this.lights.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
          this.lights.add(new THREE.AmbientLight(0x000000));

          this._scene.add(this.grid);
          this._scene.add(this.lights);

          this.mouseDown = false;
     }

     get algorithm() { return this._algorithm; }
     set algorithm(algorithm) { this._algorithm = algorithm; }
     get scene() { return this._scene; }
     get controlPointImpostors() { return this._controlPointImpostors; }

     add(o) { this._scene.add(o); }

     animate() {
          this._scene.remove(this.algorithmLine);
          this._scene.remove(this.controlLine);

          for(i = 0; i < this.controlPoints.length; i++)
               this.controlPoints[i].copy(this._controlPointImpostors.children[i].position);

          this.algorithmPoints = this._algorithm({
               controlPoints1D: this.controlPoints,
               recursionDepth: 3//TODO: text.Rekursionstiefe
          });

          this.algorithmLine = this.insertSegmetStrip(this.algorithmPoints, new THREE.Color(0x009D82));
          this.controlLine = this.insertSegmetStrip(this.controlPoints, new THREE.Color(0xFF0000));

          this._scene.add(this.algorithmLine);
          this._scene.add(this.controlLine);
     }

     addControlPoint(point) {
          var sphere = new HAPPAH.SphericalImpostor(1);
          sphere.material.uniforms.diffuse.value.set(new THREE.Color(0x888888));
          sphere.position.x = point.x;
          sphere.position.y = point.y;
          sphere.position.z = point.z;
          this._controlPointImpostors.add(sphere);
          this.controlPoints.push(point);
          this._scene.add(this._controlPointImpostors);
     }

     insertSegmetStrip(points, color) {
          var lineGeometry = new THREE.Geometry();
          var lineMaterial = new THREE.LineBasicMaterial();
          lineMaterial.color = color;
          lineMaterial.linewidth = 5;

          var showPoints = false;
          if (showPoints) {
               for (i = 0; i < points.length; i++) {
                    lineGeometry.vertices.push(points[i]);
                    var boxG = new THREE.Geometry();
                    boxG.translate(points[i].x, points[i].y, points[i].z);
                    var boxM = new THREE.MeshBasicMaterial({
                         color: 0x00ff00
                    });
                    var box = new THREE.Mesh(boxG, boxM);
                    this._scene.add(box);
               }
          } else {
               for (i = 0; i < points.length; i++) {
                    lineGeometry.vertices.push(points[i]);
               }
          }
          lineGeometry.computeLineDistances();
          var line = new THREE.Line(lineGeometry, lineMaterial);

          return line;
     }

     drawPointCloud(points) {
          var pointGeometry = new THREE.Geometry();
          var material = new THREE.PointCloudMaterial({
               size: 6,
               sizeAttenuation: false
          });
          var pointCloud = new THREE.PointCloud(pointGeometry, material);

          // Adds all the points to pointgeometry.
          for (i = 0; i < points.length; i++) {
               pointGeometry.vertices.push(new THREE.Vector3(points[i][0],
                    points[i][1],
                    points[i][2]));
          }
          // Connect the points with lines.
          var line = new THREE.Line(pointGeometry,
               new THREE.LineBasicMaterial({
                    color: 0xccafff,
                    opacity: 0.5
               }));

          // Add to _scene:
          this._scene.add(line);
          this._scene.add(pointCloud);

     }

     }
     return { Scene: Scene };
});


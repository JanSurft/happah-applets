define(['jquery', 'three', 'spherical-impostor'], function($, THREE, happah) {
     var s_algorithm = Symbol('algorithm');
     var s_lights = Symbol('lights');
     var s_algorithmPoints = Symbol('algorithmpoints');
     var s_algorithmLine = Symbol('algorithmline');
     var s_controlLine = Symbol('controlline');

     /** Flags for drawing preferences */
     // Set to true if scene has been altered.
     var s_altered = Symbol('altered');
     var s_showCurve = Symbol('showcurve');

     // If set: will draw control polygon
     var s_showPoly = Symbol('showpoly');

     class Scene extends THREE.Scene {

               constructor() {
                    super();
                    this[s_algorithm] = function(points, value) {
                         return points;
                    };
                    this.controlPoints = [];
                    this.algorithmPoints = [];
                    this._controlPointImpostors = new THREE.Object3D();

                    this[s_lights] = new THREE.Object3D();

                    var ambientLight = new THREE.AmbientLight(0x444444);
                    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x00ee00, 1);
                    //this[s_lights].add(ambientLight);
                    this[s_lights].add(hemisphereLight);
                    var dirLight = new THREE.DirectionalLight(0xffffff);
                    dirLight.position.set(200, 200, 1000).normalize();
                    this[s_lights].add(dirLight);
                    // this[s_lights].add(dirLight.target);
                    //this.camera.add(dirLight.target);
                    //this.add(this[s_algorithmLine]);
                    //this.add(this[s_controlLine]);


                    //var light = new THREE.PointLight(0xffffff, 1, 0);
                    //light.position.set(0, 200, 0);
                    //this[s_lights].add(light);
                    //light = new THREE.PointLight(0xffffff, 1, 0);
                    //light.position.set(100, 200, 100);
                    //this[s_lights].add(light);
                    //light = new THREE.PointLight(0xffffff, 1, 0);
                    //light.position.set(-100, -200, -100);
                    //this[s_lights].add(light);
                    //this[s_lights].add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
                    //this[s_lights].add(new THREE.AmbientLight(0x000000));
                    this.add(this[s_lights]);
                    this[s_altered] = true;
                    this[s_showPoly] = true;
                    this[s_showCurve] = true;
               }

               get algorithm() {
                    return this[s_algorithm];
               }
               set algorithm(algorithm) {
                    this[s_algorithm] = algorithm;
                    this.redraw();
               }
               get controlPointImpostors() {
                    return this._controlPointImpostors;
               }
               set controlPolygonState(state) {
                    this[s_showPoly] = state;
                    this.redraw();

                    if (this[s_showPoly]) {
                         this.add(this._controlPointImpostors);
                    } else {
                         // Don't draw impostors
                         this.remove(this._controlPointImpostors);
                    }
               }
               set curveState(state) {
                    this[s_showCurve] = state;
                    this.redraw();
               }

               /** Redraws the curve in the next animate() cycle */
               redraw() {
                    this[s_altered] = true;
               }

               animate() {
                    // Only re-calculate if things have changed.
                    if (this[s_altered]) {
                         console.log("redraw impostors/lines");

                         // Remove lines from the scene to edit them
                         this.remove(this[s_algorithmLine]);
                         this.remove(this[s_controlLine]);

                         // Only calculate the lines if they're enabled
                         if (this[s_showCurve]) {
                              for (var i = 0; i < this.controlPoints.length; i++)
                                   this.controlPoints[i].copy(this._controlPointImpostors.children[i].position);

                              this[s_algorithmPoints] = this[s_algorithm].subdivide();
                              this[s_algorithmLine] = this.insertSegmetStrip(this[s_algorithmPoints], new THREE.Color(0x009D82));
                              this.add(this[s_algorithmLine]);
                         }

                         if (this[s_showPoly]) {
                              this[s_controlLine] = this.insertSegmetStrip(this.controlPoints, new THREE.Color(0xFF0000));
                              this.add(this[s_controlLine]);
                         }

                         this[s_altered] = false;
                    }
               }

               addControlPoints(points, color = new THREE.Color(0x888888)) {
                    for (var i in points) {
                         var sphere = new happah.SphericalImpostor(3);
                         sphere.material.uniforms.diffuse.value.set(color);
                         sphere.position.copy(points[i]);
                         this._controlPointImpostors.add(sphere);
                         this.controlPoints.push(points[i]);
                    }
                    if (this[s_showPoly])
                         this.add(this._controlPointImpostors);

                    this.redraw();
                    $(this).trigger('update.happah');
               }

               removeControlPoints() {
                    // Remove everything from the scene
                    this.remove(this._controlPointImpostors);
                    this.controlPoints.length = 0;
                    var sadf = this.controlPoints;
                    this._controlPointImpostors.children = [];
                    this.redraw();
               }

               insertSegmetStrip(points, color) {
                    if (points.length === 0)
                         return new THREE.Line();

                    var lineGeometry = new THREE.Geometry();
                    var lineMaterial = new THREE.LineBasicMaterial();
                    lineMaterial.color = color;
                    lineMaterial.linewidth = 5;

                    for (var i = 0; i < points.length; i++) {
                         lineGeometry.vertices.push(points[i]);
                    }
                    lineGeometry.computeLineDistances();
                    var line = new THREE.Line(lineGeometry, lineMaterial);

                    return line;
               }

          } //class Scene

     return {
          Scene: Scene
     };
});

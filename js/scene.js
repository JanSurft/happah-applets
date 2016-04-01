define(['jquery', 'three', 'spherical-impostor'], function($, THREE, happah) {
    var s_algorithm = Symbol('algorithm');
    var s_lights = Symbol('lights');

    // Set to true if scene has been altered.
    var s_altered = Symbol('altered');

    class Scene extends THREE.Scene {

            /*var algorithmPoints = [];
            var algorithmLine;
            var controlLine;
            var controlPoints = [];
            this._controlPointImpostors = null;*/

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

            /** Redraws the curve in the next animate() cycle */
            redraw() {
                this[s_altered] = true;
            }

            animate() {
                // Only re-calculate if things have changed.
                if (this[s_altered]) {
                    console.log("redraw impostors/lines");
                    this.remove(this.algorithmLine);
                    this.remove(this.controlLine);

                    for (var i = 0; i < this.controlPoints.length; i++)
                        this.controlPoints[i].copy(this._controlPointImpostors.children[i].position);

                    this.algorithmPoints = this[s_algorithm]({
                        controlPoints1D: this.controlPoints,
                        recursionDepth: 30 //TODO: text.Rekursionstiefe
                    });

                    this.algorithmLine = this.insertSegmetStrip(this.algorithmPoints, new THREE.Color(0x009D82));
                    this.controlLine = this.insertSegmetStrip(this.controlPoints, new THREE.Color(0xFF0000));

                    this.add(this.algorithmLine);
                    this.add(this.controlLine);
                    this[s_altered] = false;
                }
            }

            addControlPoint(point) { //TODO: addControlPoints (many at once)
                var sphere = new happah.SphericalImpostor(3);
                sphere.material.uniforms.diffuse.value.set(new THREE.Color(0x888888));
                sphere.position.x = point.x;
                sphere.position.y = point.y;
                sphere.position.z = point.z;
                this._controlPointImpostors.add(sphere);
                this.controlPoints.push(point);
                this.add(this._controlPointImpostors);
                this.redraw();
                $(this).trigger('update.happah');
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
                        this.add(box);
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

        } //class Scene

    return {
        Scene: Scene
    };
});

define(['jquery', 'three', 'spherical-impostor'], function($, THREE, happah) {
    var s_lights = Symbol('lights');

    /** Flags for drawing preferences */
    // Set to true if scene has been altered.
    var s_altered = Symbol('altered');
    var s_showCurve = Symbol('showcurve');

    // If set: will draw control polygon
    var s_showPoly = Symbol('showpoly');
    //var s_geometries = Symbol('geometries');
    // Store a set of meshes
    var s_meshes = Symbol('meshes');
    var s_points = Symbol('points');

    class Scene extends THREE.Scene {

            constructor() {
                super();
                this.controlPoints = [];
                this.algorithmPoints = [];
                this[s_points] = [];
                this[s_meshes] = [new THREE.Object3D()];
                this._controlPointImpostors = new THREE.Object3D();

                this[s_lights] = new THREE.Object3D();

                var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x00ee00, 1);
                this[s_lights].add(hemisphereLight);
                var dirLight = new THREE.DirectionalLight(0xffffff);
                dirLight.position.set(200, 200, 1000).normalize();
                this[s_lights].add(dirLight);

                this.add(this[s_lights]);
                this[s_altered] = true;
                this[s_showPoly] = true;
                this[s_showCurve] = true;
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
            set meshes(meshes) {
                // Remove the meshes first
                for (var i = 0; i < this[s_meshes].length; i++) {
                    this.remove(this[s_meshes][i]);
                }
                this[s_meshes] = meshes;
                this.redraw();
            }

            set points(points) {
                // Remove points first
                for (var i = 0; i < this[s_points].length; i++) {
                    this.remove(this[s_points][i]);
                    this.add(points[i]);
                }
                this[s_points] = points;
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
                    this[s_altered] = false;

                    if (this[s_showPoly]) {
                        this.add(this._controlPointImpostors);
                    }
                    // Update controlpoints positions
                    for (var i in this.controlPoints)
                        this.controlPoints[i].copy(this._controlPointImpostors.children[i].position);

                    // Add all geometries from the current frame
                    for (var i in this[s_meshes]) {
                        this.add(this[s_meshes][i]);
                    }

                }
            }

            removeControlPoints() {
                // Remove everything from the scene
                this.remove(this._controlPointImpostors);
                this.controlPoints.length = 0;
                this._controlPointImpostors.children = [];
                this.redraw();
            }

        } //class Scene

    return {
        Scene: Scene
    };
});

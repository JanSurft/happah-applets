define(['jquery', 'three', 'spherical-impostor'], function($, THREE, happah) {
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
                    for (var i in this[s_meshes]) {
                         this.remove(this[s_meshes][i]);
                    }
                    this[s_meshes] = meshes;
                    this.redraw();
               }

               set points(points) {
                    // Remove points first
                    for (var i in this[s_points]) {
                         this.remove(this[s_points][i]);
                    }
                    this[s_points] = points;
                    this.redraw();
               }

               // remove this later
               get altered() {
                    return this[s_altered];
               }

               /** Redraws the curve in the next animate() cycle */
               redraw() {
                    this[s_altered] = true;
               }

               paint() {
                    // Only re-calculate if things have changed.
                    if (this[s_altered]) {
                         console.log("redraw impostors/lines");
                         this[s_altered] = false;

                         // The very first mesh is the control-polygon
                         if (this[s_showPoly]) {
                              this.add(this._controlPointImpostors);
                              this.add(this[s_meshes][0]);
                         }
                         // Update controlpoints positions,
                         // in case they have been altered by drag-and-drop
                         for (var i in this.controlPoints) {
                              this.controlPoints[i].copy(this._controlPointImpostors.children[i].position);
                         }
                         // Add all meshes
                         for (var i in this[s_meshes]) {
                              this.add(this[s_meshes][i]);
                         }
                         // Add all points
                         for (var i in this[s_points]) {
                              this.add(this[s_points][i]);
                         }

                    }
               }

               removeControlPoints() {
                    // Remove everything from the scene
                    this.remove(this._controlPointImpostors);
                    //TODO: why set length to 0?
                    this.controlPoints.length = 0;
                    this._controlPointImpostors.children = [];
                    this.redraw();
               }

          } //class Scene

     return {
          Scene: Scene
     };
});

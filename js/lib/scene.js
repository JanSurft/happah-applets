define(['jquery', 'three', './spherical-impostor'], function($, THREE, happah) {
     /** Flags for drawing preferences */

     // Set to true if scene has been altered.
     var s_altered = Symbol('altered');
     var s_showCurve = Symbol('showcurve');

     // If set: will draw control polygon
     var s_showPoly = Symbol('showpoly');
     //var s_geometries = Symbol('geometries');
     // Store a set of lines
     var s_lines = Symbol('lines');

     // Rename points -> impostors to reduce confusion
     var s_points = Symbol('points');

     class Scene extends THREE.Scene {

               constructor() {
                    super();
                    this.controlPoints = [];
                    this.algorithmPoints = [];
                    this[s_points] = new THREE.Object3D();
                    this[s_lines] = [new THREE.Object3D()];
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
                    //this.redraw();
                    $.event.trigger({
                         type: "change",
                         // For easy debugging
                         message: "control-polygon was toggled!",
                    });

                    if (this[s_showPoly]) {
                         this.add(this._controlPointImpostors);
                    } else {
                         // Don't draw impostors
                         this.remove(this._controlPointImpostors);
                    }
               }
               set curveState(state) {
                    this[s_showCurve] = state;
                    //this.redraw();
                    $.event.trigger({
                         type: "change",
                         message: "curve state has changed!",
                    });
               }
               set lines(lines) {
                    this.remove(this[s_lines])
                    this[s_lines] = new THREE.Object3D()
                    for (var i in lines) {
                         this[s_lines].add(lines[i])
                    }
                    this.add(this[s_lines])
                         //this.redraw();
                         //$.event.trigger({
                         //type: "change",
                         //message: "lines have been set!",
                         //});
               }

               set points(points) {
                    this.remove(this[s_points]);
                    this[s_points] = points;
                    this.add(points);
                    //this.redraw();
                    //$.event.trigger({
                    //type: "change",
                    //message: "points have been set!",
                    //});
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
                    console.log("redraw impostors/lines");
                    this[s_altered] = false;

                    // The very first mesh is the control-polygon
                    if (this[s_showPoly]) {
                         this.add(this._controlPointImpostors);
                         //this.add(this[s_lines]);
                    }
                    // Update controlpoints positions,
                    // in case they have been altered by drag-and-drop
                    for (var i in this.controlPoints) {
                         this.controlPoints[i].copy(this._controlPointImpostors.children[i].position);
                    }
                    // Add all lines
                    //for (var i in this[s_lines]) {
                    //this.add(this[s_lines][i]);
                    //}
               }

               removeControlPoints() {
                    // Remove everything from the scene
                    this.remove(this._controlPointImpostors);
                    //TODO: why set length to 0?
                    this.controlPoints.length = 0;
                    this._controlPointImpostors.children = [];
                    // FIRE CUSTOM JQUERY EVENT
                    $.event.trigger({
                         type: "rebuildStoryboard",
                         message: "control have been removed!",
                    });
               }

          } //class Scene

     return {
          Scene: Scene
     };
});

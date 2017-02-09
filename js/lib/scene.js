//////////////////////////////////////////////////////////////////////////////
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
// @author Stephan Engelmann (stephan-enelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three', './spherical-impostor'], function($, THREE, happah) {
     /** Flags for drawing preferences */

     var s_showCurve = Symbol('showcurve');

     // If set: will draw control polygon
     var s_showPoly = Symbol('showpoly');
     //var s_geometries = Symbol('geometries');
     // Store a set of lines
     var s_lines = Symbol('lines');
     var s_controlPoints = Symbol('controlpoints');
     var s_controlPointImpostors = Symbol('controlpointimpostors');

     // Rename points -> impostors to reduce confusion
     var s_points = Symbol('points');

     class Scene extends THREE.Scene {

               constructor() {
                    super();
                    //this.controlPoints = [];
                    this[s_controlPoints] = [];
                    this[s_controlPointImpostors] = [];
                    this[s_points] = new THREE.Object3D();
                    this[s_lines] = [new THREE.Object3D()];
                    //this._controlPointImpostors = new THREE.Object3D();
                    this[s_showPoly] = true;
                    this[s_showCurve] = true;
               }

               get controlPointImpostors() {
                    return this[s_controlPointImpostors];
               }

               get controlPoints() {
                    return this[s_controlPoints];
               }

               set lines(lines) {
                    this.remove(this[s_lines])
                    this[s_lines] = new THREE.Object3D()
                    for (var i in lines) {
                         this[s_lines].add(lines[i])
                    }
                    this.add(this[s_lines])
                         //$.event.trigger({
                         //type: "change",
                         //message: "lines have been set!",
                         //});
               }

               set points(points) {
                    this.remove(this[s_points]);
                    this[s_points] = points;
                    this.add(points);
                    //$.event.trigger({
                    //type: "change",
                    //message: "points have been set!",
                    //});
               }

               paint() {
                    // The very first mesh is the control-polygon
                    if (this[s_showPoly]) {
                         //this.add(this._controlPointImpostors);
                         for (var i in this[s_controlPointImpostors]) {
                              this.add(this[s_controlPointImpostors][i]);
                         }
                    }

                    // Update controlpoints positions,
                    // in case they have been altered by drag-and-drop
                    for (var i in this.controlPoints) {
                         //this.controlPoints[i].copy(this._controlPointImpostors.children[i].position);
                         this.controlPoints[i].copy(this[s_controlPointImpostors][i].position);
                    }
               }

               removeControlPoints() {
                    // Remove everything from the scene
                    this.remove(this[s_controlPointImpostors]);
                    //TODO: why set length to 0?
                    this.controlPoints.length = 0;
                    this._controlPointImpostors.children = [];

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

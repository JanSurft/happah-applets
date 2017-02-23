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
                    console.warn("HAPPAH.Scene should not be used!");
                    this[s_controlPoints] = [];
                    this[s_controlPointImpostors] = [];
                    this[s_points] = new THREE.Object3D();
                    this[s_lines] = [new THREE.Object3D()];
                    //this._controlPointImpostors = new THREE.Object3D();
                    this[s_showPoly] = true;
                    this[s_showCurve] = true;
               }

               //get controlPointImpostors() {
               //console.log("set controlpoints called!");
               //return this[s_controlPointImpostors];
               //}

               //get controlPoints() {
               //console.log("get controlpoints called!");
               //return this[s_controlPoints];
               //}

               //set lines(lines) {
               //console.log("set lines called");
               //this.remove(this[s_lines])
               //this[s_lines] = new THREE.Object3D()
               //for (var i in lines) {
               //this[s_lines].add(lines[i])
               //}
               //this.add(this[s_lines])
               ////$.event.trigger({
               ////type: "change",
               ////message: "lines have been set!",
               ////});
               //}

               //set points(points) {
               //this.remove(this[s_points]);
               //this[s_points] = points;
               //this.add(points);
               ////$.event.trigger({
               ////type: "change",
               ////message: "points have been set!",
               ////});
               //}


          } //class Scene

     return {
          Scene: Scene
     };
});

//////////////////////////////////////////////////////////////////////////////
//
// @author Stephan Engelmann (stephan-engelmann@gmx.de)
//
// This algorithm demonstrates the joining of two curves, each defined by a
// control polygon and de'Casteljau algorithm. The corner points of the control
// polygons will be repositioned to create a junction point with a higher level
// continuity (C^0, C^1, C^2 ..).
//
//////////////////////////////////////////////////////////////////////////////

import * as THREE from "three";
import HAPPAH from "../lib/happah";

let s_controlPoints = Symbol('controlPoints');
let s_extraPoints = Symbol('extrapoints');
let s_scrollbar = Symbol('scrollbar');
let s_camera = Symbol('camera');

class Algorithm {

     /** Default constructor. */
     constructor(controlPoints, scrollbar, camera) {
          this.storyboard = this.storyboard.bind(this);
          this[s_controlPoints] = controlPoints;
          this[s_scrollbar] = scrollbar;
          this[s_camera] = camera;
          let origin = new THREE.Vector3(120, 0, -30);
          this[s_extraPoints] = [
               new THREE.Vector3(-60, 0, 0).add(origin),
               new THREE.Vector3(-20, 0, 0).add(origin),
               new THREE.Vector3(20, 0, 0).add(origin),
               new THREE.Vector3(60, 0, 0).add(origin),
          ];
     }

     /**
      * Set scrollbar
      */
     set scrollbar(scrollbar) {
          this[s_scrollbar] = scrollbar;
     }

     /**
      * Returns a storyboard with frames that contain the different steps
      * of the algorithm
      */
     storyboard() {
          let controlPoints = this[s_controlPoints];
          let extraPoints = this[s_extraPoints];
          let storyboard = new HAPPAH.Storyboard(this);
          let imp_template = new HAPPAH.SphericalImpostor(3);
          imp_template.material.uniforms.diffuse.value.set(
               HAPPAH.Colors.COLOR2);

          // ================================================================
          // Create the base frame
          // ================================================================

          let frame0 = new HAPPAH.Storyboard.Frame();
          frame0.title = "Controlpolygon";
          frame0.lines.push(HAPPAH.Util.insertSegmentStrip(controlPoints,
               HAPPAH.Colors.COLOR1));
          frame0.lines.push(HAPPAH.Util.insertSegmentStrip(extraPoints,
               HAPPAH.Colors.COLOR2));
          for (let i of extraPoints) {
               let imp = imp_template.clone();
               imp.position.copy(i);
               frame0.points.add(imp);
          }
          storyboard.append(frame0);

          if (controlPoints.length < 3) {
               // Add a dummy mesh
               frame0.lines[0] = new THREE.Object3D();
               storyboard.index = 0;
               return storyboard;
          }
          // ================================================================
          // precalc characteristic points for the junctions
          // ================================================================

          // characteristic points for ck junctions
          // --------------------------------------
          // 1. To joint two curves some of the endpoints of the curves
          // have to be manipulated. The positions of those points can be
          // calculated using the de' Casteljau construction of the
          // characterizing points.
          // 2. Divide the junction into the left and right part
          // respective for the two curves.
          let b = this[s_scrollbar];
          let characteristicPoints = [
               // The c^0 junction is a special case and will be handled
               // separately!
               // [controlPoints[controlPoints.length - 1]],
               [
                    controlPoints[controlPoints.length - 2],
                    extraPoints[1],
               ],
               [
                    controlPoints[controlPoints.length - 3],
                    controlPoints[controlPoints.length - 3].clone().add((
                         controlPoints[controlPoints.length - 2].clone().sub(
                              controlPoints[controlPoints.length - 3])
                    ).multiplyScalar(1 / b.value)),
                    extraPoints[2],
               ],
               [
                    controlPoints[controlPoints.length - 4],
                    controlPoints[controlPoints.length - 4].clone().add((
                         controlPoints[controlPoints.length - 3].clone().sub(
                              controlPoints[controlPoints.length - 4])
                    ).multiplyScalar(1 / b.value)),
                    extraPoints[3].clone().add((extraPoints[3].clone().sub(
                         extraPoints[2])).multiplyScalar(-1 / (1 - b.value))),
                    extraPoints[3],
               ]
          ];
          let leftJunctionPoints = [];
          let rightJunctionPoints = [];
          for (let pointSet of characteristicPoints) {
               let algorithm = new HAPPAH.DeCasteljauAlgorithm(pointSet, b);
               let front = [];
               let back = [];
               algorithm.evaluate(b.value, function(result) {
                    front.push(result[0]);
                    back.push(result[result.length - 1])
               });
               back = back.reverse();
               leftJunctionPoints.push(front);
               rightJunctionPoints.push(back);
          }

          // ================================================================
          // Create the c^1 junction by hand
          // ================================================================

          // First frame is constructed by moving the first point of the
          // right polygon onto the last of the left polygon.
          let frame1 = new HAPPAH.Storyboard.Frame();

          // move the first extra point to last control point
          let frame1RightPoints = [];
          frame1RightPoints.push(controlPoints[controlPoints.length - 1]);
          for (let i = 1; i < extraPoints.length; i++) {
               frame1RightPoints.push(extraPoints[i]);
          }

          // add right control points as impostors to first frame
          for (let cp of frame1RightPoints) {
               let cp_imp = imp_template.clone();
               cp_imp.position.copy(cp);
               frame1.points.add(cp_imp);
          }

          // add both control polygons to first frame
          frame1.lines.push(HAPPAH.Util.insertSegmentStrip(
               controlPoints, HAPPAH.Colors.COLOR1));
          frame1.lines.push(HAPPAH.Util.insertSegmentStrip(
               frame1RightPoints, HAPPAH.Colors.COLOR2));

          // add curves to first frame
          let frame1LeftCurve = new HAPPAH.DeCasteljauAlgorithm(
               controlPoints, null);
          frame1.lines.push(HAPPAH.Util.insertSegmentStrip(
               frame1LeftCurve.subdivide(4, 0.5), HAPPAH.Colors.BLACK));
          let frame1RightCurve = new HAPPAH.DeCasteljauAlgorithm(
               frame1RightPoints, null);
          frame1.lines.push(HAPPAH.Util.insertSegmentStrip(
               frame1RightCurve.subdivide(4, 0.5), HAPPAH.Colors.BLACK));

          storyboard.append(frame1);

          // ================================================================
          // Create frames with c^k junction for k in [2,4]
          // ================================================================
          for (let frameCounter = 0; frameCounter < 3; frameCounter++) {
               let frame = new HAPPAH.Storyboard.Frame();

               // Construct point coordinates for left and right curve
               // using their original coordinates and the calculated
               // junction points.
               let leftPoints = [];
               let rightPoints = [];
               let k = 0;
               for (let i = 0; i < controlPoints.length; i++) {
                    if (i < controlPoints.length - frameCounter - 1) {
                         leftPoints.push(controlPoints[i]);
                         rightPoints.push(extraPoints[
                              extraPoints.length - i - 1]);
                         k = 0;
                    } else {
                         leftPoints.push(leftJunctionPoints[frameCounter][k]);
                         rightPoints.push(rightJunctionPoints[frameCounter][
                              rightJunctionPoints[frameCounter].length - k - 1
                         ]);
                         k++;
                    }
               }
               rightPoints = rightPoints.reverse();

               // Add new right control points
               for (let cp of rightPoints) {
                    let cp_imp = imp_template.clone();
                    cp_imp.position.copy(cp);
                    frame.points.add(cp_imp);
               }

               // Add left and right curve control polygons
               frame.lines.push(HAPPAH.Util.insertSegmentStrip(
                    leftPoints, HAPPAH.Colors.COLOR1));
               frame.lines.push(HAPPAH.Util.insertSegmentStrip(
                    rightPoints, HAPPAH.Colors.COLOR2));

               // Add left and right curve
               let leftCurve = new HAPPAH.DeCasteljauAlgorithm(
                    leftPoints, null);
               frame.lines.push(HAPPAH.Util.insertSegmentStrip(
                    leftCurve.subdivide(4, 0.5), HAPPAH.Colors.BLACK));
               let rightCurve = new HAPPAH.DeCasteljauAlgorithm(
                    rightPoints, null);
               frame.lines.push(HAPPAH.Util.insertSegmentStrip(
                    rightCurve.subdivide(4, 0.5), HAPPAH.Colors.BLACK));

               storyboard.append(frame);
          }
          return storyboard;
     }
}

export {
     Algorithm
};

//////////////////////////////////////////////////////////////////////////////
//
// Drag-and-drop control points on a specified line
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', '../lib/happah'], function($, THREE, HAPPAH) {
     var s_axis = Symbol('axis');
     //var s_selectedObject = Symbol('selectedobject');

     class LineDragControls extends HAPPAH.DragControls {
               constructor(objects, controls, camera) {
                    super(objects, controls, camera);

                    this[s_axis] = new THREE.Line3();
               }

               //@Override
               selectObject(object) {
                    // Update axis
                    var position = object.position.clone();

                    // Set Z-value to height of our axis
                    // TODO: parameterize
                    var projection = object.position.clone();
                    projection.z += 10;

                    // The axis that our object will move along
                    this[s_axis].set(projection, position);

                    super.selectedObject = object;
               }

               //@Override
               updatePosition(object, position) {
                    // Object is constrained to the axis
                    var newPos = this[s_axis].closestPointToPoint(position);
                    object.position.copy(newPos);
               }

          } // lineDragControls

     return {
          LineDragControls: LineDragControls
     };
});

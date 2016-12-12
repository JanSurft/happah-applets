//////////////////////////////////////////////////////////////////////////////
//
// @author: Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['three'], function(THREE) {

     class Util {
          constructor() {}

          static getElementPosition(element) {
               var position = new THREE.Vector2(0, 0);

               while (element) {
                    position.x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                    position.y += (element.offsetTop - element.scrollTop + element.clientTop);
                    element = element.offsetParent;
               }
               return position;
          }

          static insertSegmentStrip(points, color) {
               if (points == null || points.length == 0)
                    return null;

               var lineGeometry = new THREE.Geometry();
               var lineMaterial = new THREE.LineBasicMaterial({
                    color: color,
                    linewidth: 5
               });

               for (var i = 0; i < points.length; i++) {
                    lineGeometry.vertices.push(points[i]);
               }
               lineGeometry.computeLineDistances();
               return new THREE.Line(lineGeometry, lineMaterial);
          }

          static insertDashedLine(points, color) {
               if (points == null || points.length == 0)
                    return null;

               var lineGeometry = new THREE.Geometry();
               var lineMaterial = new THREE.LineDashedMaterial({
                    color: color,
                    linewidth: 1
               });

               for (var i = 0; i < points.length; i++) {
                    lineGeometry.vertices.push(points[i]);
               }
               lineGeometry.computeLineDistances();
               return new THREE.Line(lineGeometry, lineMaterial);
          }
     } // class Util

     return {
          Util: Util
     };

});

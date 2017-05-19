//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
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

          static getPositionOnCanvas(event) {
               var elementPosition = this.getElementPosition(event.target);
               var vector = new THREE.Vector2();

               // Get mouse position
               vector.x = ((event.clientX - elementPosition.x + window.pageXOffset) / event.target.width) * 2 - 1;
               vector.y = -((event.clientY - elementPosition.y + window.pageYOffset) / event.target.height) * 2 + 1;

               return vector;
          }

          /**
           * Generate a THREE.js line
           *
           * A line is generated along the given points with a cutom color
           */
          static insertSegmentStrip(points, color) {
               if (points == null || points.length == 0)
                    return null;

               let lineGeometry = new THREE.Geometry();
               let lineMaterial = new THREE.LineBasicMaterial({
                    color: color,
                    linewidth: 5
               });

               for (let i = 0; i < points.length; i++) {
                    lineGeometry.vertices.push(points[i]);
               }
               lineGeometry.computeLineDistances();
               return new THREE.Line(lineGeometry, lineMaterial);
          }

          /**
           * Generate a THREE.js dashed line
           *
           * A dashed line is generated along the given points with a cutom
           * color
           */
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

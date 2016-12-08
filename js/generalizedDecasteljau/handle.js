//////////////////////////////////////////////////////////////////////////////
//
// Handle for multi-handle-scrollbar
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['three'], function(THREE) {

     class Handle extends THREE.Mesh {
               constructor(position, color) {
                    var geo = new THREE.BoxGeometry(4, 8, 8);
                    var mat = new THREE.MeshBasicMaterial({
                         color: color
                    });
                    super(geo, mat);

                    // Apply the position
                    this.position.setX((position / 150) + 0.5);
               }

               get color() {
                    return this.material.color;
               }

               get value() {
                    return (this.position.x / 150) + 0.5;
               }

          } // Class Handle

     return {
          Handle: Handle
     };
});

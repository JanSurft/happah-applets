//////////////////////////////////////////////////////////////////////////////
//
// Interface
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three'], function($, THREE) {
     var s_grid = Symbol('grid');
     var s_scene = Symbol('scene');
     var s_gridEnabled = Symbol('gridenabled');

     class Interface {
          constructor(scene) {
               this[s_scene] = scene;
               this[s_grid] = new THREE.GridHelper(100, 10);
               this[s_gridEnabled] = true;
               $("#hph-grid").click(this.toggleGrid());
               console.log("Init interface...");
          }

          toggleGrid() {
               if (this[s_gridEnabled]) {
                    this[s_scene].add(this[s_grid]);
               } else {
                    this[s_scene].remove(this[s_grid]);
               }
               this[s_gridEnabled] = !this[s_gridEnabled];
          }


     } // Class Interface

     return {
          Interface: Interface
     };

});

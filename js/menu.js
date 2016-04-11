//////////////////////////////////////////////////////////////////////////////
//
// Interface
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three'], function($, THREE) {
     var s_grid = Symbol('grid');
     var s_scene = Symbol('scene');
     var s_viewport = Symbol('viewport');
     var s_gridEnabled = Symbol('gridenabled');
     var s_content = Symbol('content');

     class Menu {
          constructor(selector, scene, viewport) {
               this[s_content] = $(selector);
               this[s_scene] = scene;
               this[s_viewport] = viewport;
               this[s_grid] = new THREE.GridHelper(100, 10);
               this[s_grid].position.y = -0.001;
               this[s_gridEnabled] = true;

               this[s_content].find("#grid-toggle").on('click', {
                    _this: this
               }, this.toggleGrid);
               this[s_content].find("#addmode-toggle").on('click', {
                    _this: this
               }, this.toggleAddMode);
          }

          toggleGrid(event) {
               if (event.data._this[s_gridEnabled]) {
                    event.data._this[s_scene].add(event.data._this[s_grid]);
               } else {
                    event.data._this[s_scene].remove(event.data._this[s_grid]);
               }
               event.data._this[s_gridEnabled] = !event.data._this[s_gridEnabled];
          }

          toggleAddMode(event) {
               event.data._this[s_viewport].toggleAddMode();
          }


     } // Class Interface

     return {
          Menu: Menu
     };

});

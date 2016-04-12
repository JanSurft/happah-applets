//////////////////////////////////////////////////////////////////////////////
//
// Interface
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three'], function($, THREE) {
     var s_scene = Symbol('scene');
     var s_viewport = Symbol('viewport');
     var s_gridEnabled = Symbol('gridenabled');
     var s_content = Symbol('content');

     class Menu {
          constructor(selector, scene, viewport) {
               this[s_content] = $(selector);
               this[s_scene] = scene;
               this[s_viewport] = viewport;
               this[s_gridEnabled] = true;
               this[s_viewport].setGridState(true);
               $('#grid-toggle').parent().addClass('active');

               this[s_content].find("#grid-toggle").on('click', {
                    _this: this
               }, this.toggleGrid);
               this[s_content].find("#addmode-toggle").on('click', {
                    _this: this
               }, this.toggleAddMode);
               this[s_content].find("#poly-toggle").on('click', {
                    _this: this
               }, this.toggleControlPolygon);
               this[s_content].find("#clear-all").on('click', {
                    _this: this
               }, this.clearControlPoints);
          }

          toggleGrid(event) {
               event.data._this[s_gridEnabled] = !event.data._this[s_gridEnabled];

               if (event.data._this[s_gridEnabled]) {
                    $('#grid-toggle').parent().addClass('active');
               } else {
                    $('#grid-toggle').parent().removeClass('active');
               }
               event.data._this[s_viewport].setGridState(event.data._this[s_gridEnabled]);
          }

          toggleAddMode(event) {
               event.data._this[s_viewport].toggleAddMode();
               event.data._this[s_scene].redraw();
          }

          toggleControlPolygon(event) {
               event.data._this[s_scene].toggleControlPolygon();
          }

          clearControlPoints(event) {
               event.data._this[s_scene].removeControlPoints();
          }

     } // Class Interface

     return {
          Menu: Menu
     };

});

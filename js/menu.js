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
     var s_addModeEnabled = Symbol('addmodeenabled');
     var s_showControlPoly = Symbol('showcontrolpoly');
     var s_content = Symbol('content');

     class Menu {
          constructor(selector, scene, viewport) {
               this[s_content] = $(selector);
               this[s_scene] = scene;
               this[s_viewport] = viewport;
               this[s_gridEnabled] = true;
               this[s_addModeEnabled] = false;
               this[s_showControlPoly] = true;
               this[s_viewport].gridState = true;
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
               this[s_content].find("#hph-forward").on('click', {
                    _this: this
               }, this.next);
               this[s_content].find("#hph-backward").on('click', {
                    _this: this
               }, this.previous);
          }

          toggleGrid(event) {
               event.data._this[s_gridEnabled] = !event.data._this[s_gridEnabled];

               if (event.data._this[s_gridEnabled]) {
                    $('#grid-toggle').parent().addClass('active');
               } else {
                    $('#grid-toggle').parent().removeClass('active');
               }
               event.data._this[s_viewport].gridState = event.data._this[s_gridEnabled];
          }

          toggleAddMode(event) {
               event.data._this[s_addModeEnabled] = !event.data._this[s_addModeEnabled];
               event.data._this[s_viewport].addModeState = event.data._this[s_addModeEnabled];

               if (event.data._this[s_addModeEnabled]) {
                    $('#addmode-toggle').parent().addClass('active');
               } else {
                    $('#addmode-toggle').parent().removeClass('active');
               }

               event.data._this[s_scene].redraw();
          }

          toggleControlPolygon(event) {
               var state = !event.data._this[s_showControlPoly];
               event.data._this[s_showControlPoly] = state;

               if (state) {
                    $('#poly-toggle').parent().addClass('active');
               } else {
                    $('#poly-toggle').parent().removeClass('active');
               }
               event.data._this[s_scene].controlPolygonState = state;
          }

          next(event) {
               event.data._this[s_viewport].nextFrame();
          }

          previous(event) {
               event.data._this[s_viewport].previousFrame();
          }

          clearControlPoints(event) {
               event.data._this[s_scene].removeControlPoints();
          }

     } // Class Menu

     return {
          Menu: Menu
     };

});
